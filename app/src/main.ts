globalThis.process.version = '1.1.1'

import firebase from '@react-native-firebase/app'
import '@react-native-firebase/auth'

import { Platform } from 'react-native'
import { createSelfTests } from '@worldbrain/memex-common/lib/self-tests'
import { WorldbrainAuthService } from '@worldbrain/memex-common/lib/authentication/worldbrain'
import { MemoryAuthService } from '@worldbrain/memex-common/lib/authentication/memory'
import { LocalAuthService } from '@worldbrain/memex-common/lib/authentication/local'
import { TEST_USER } from '@worldbrain/memex-common/lib/authentication/dev'
import { MemexSyncDevicePlatform } from '@worldbrain/memex-common/lib/sync/types'

import './polyfills'
import {
    createStorage,
    setStorageMiddleware,
    createServerStorage,
} from './storage'
import { createServices } from './services'
import { setupBackgroundSync } from './services/background-sync'
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

    const localStorage = new LocalStorageService({
        settingsStorage: storage.modules.settings,
    })
    const services = await createServices({
        devicePlatform: Platform.OS as MemexSyncDevicePlatform,
        auth: new WorldbrainAuthService(firebase),
        localStorage,
        storage,
        signalTransportFactory: createFirebaseSignalTransport,
        sharedSyncLog: serverStorage.modules.sharedSyncLog,
    })
    await setStorageMiddleware({
        services,
        storage,
    })
    await services.sync.continuousSync.setup()

    ui.initialize({ dependencies: { storage, services } })

    setupBackgroundSync({ services })

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
