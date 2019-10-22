import AsyncStorage from '@react-native-community/async-storage'
import {
    createStorage,
    setStorageMiddleware,
    createServerStorage,
} from './storage'
import { createServices } from './services'
import { UI } from './ui'
import { createFirebaseSignalTransport } from './services/sync/signalling'
import { WorldBrainAuthService } from './services/auth/wb-auth'
import { MemoryAuthService } from './services/auth/memory'
import { createSelfTests } from './self-tests'
import { LocalAuthService } from './services/auth/local'
import { LocalStorageService } from './services/local-storage'

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
        selfTests: await createSelfTests({ storage, services }),
    })
}
