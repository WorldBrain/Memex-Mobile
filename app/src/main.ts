import AsyncStorage from '@react-native-community/async-storage'
import { createSelfTests } from '@worldbrain/memex-common/ts/self-tests'
import { WorldbrainAuthService } from '@worldbrain/memex-common/ts/authentication/worldbrain'
import { MemoryAuthService } from '@worldbrain/memex-common/ts/authentication/memory'
import { LocalAuthService } from '@worldbrain/memex-common/ts/authentication/local'
import { TEST_USER } from '@worldbrain/memex-common/ts/authentication/dev'

import './globals'
import {
    createStorage,
    setStorageMiddleware,
    createServerStorage,
} from './storage'
import { createServices } from './services'
import { UI } from './ui'
import { createFirebaseSignalTransport } from './services/sync/signalling'
import { LocalStorageService } from './services/local-storage'
import {
    insertIntegrationTestData,
    checkIntegrationTestData,
} from './tests/shared-fixtures/integration'

if (!process.nextTick) {
    process.nextTick = setImmediate
}

export async function main() {
    const ui = new UI()
    const storage = await createStorage({
        typeORMConnectionOpts: {
            type: 'react-native',
            location: 'Shared',
            database: 'memex',
        },
    })
    const serverStorage = await createServerStorage()

    const localStorage = new LocalStorageService({ storageAPI: AsyncStorage })
    const services = await createServices({
        auth: new LocalAuthService({ localStorage }),
        localStorage,
        storage,
        signalTransportFactory: createFirebaseSignalTransport,
        sharedSyncLog: serverStorage.modules.sharedSyncLog,
    })
    await setStorageMiddleware({
        services,
        storage,
    })
    ui.initialize({ dependencies: { storage, services } })
    Object.assign(globalThis, {
        services,
        storage,
        selfTests: await createSelfTests({
            storage,
            services,
            auth: {
                setUser: async ({ id }) =>
                    (services.auth as MemoryAuthService).setUser(TEST_USER),
            },
            intergrationTestData: {
                insert: () => insertIntegrationTestData({ storage }),
            },
        }),
    })
}
