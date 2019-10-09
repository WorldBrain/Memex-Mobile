import { createStorage } from './storage'
import { createServices } from './services'
import { UI } from './ui'
import { createFirebaseSignalTransport } from './services/sync/signalling'

export async function main() {
    const ui = new UI()
    const storage = await createStorage({
        typeORMConnectionOpts: {
            type: 'react-native',
            location: 'Shared',
            database: 'memex',
        },
    })

    const services = await createServices({
        storageManager: storage.manager,
        signalTransportFactory: createFirebaseSignalTransport,
    })
    ui.initialize({ dependencies: { storage, services } })
    Object.assign(global, {
        services,
        storage,
    })
}
