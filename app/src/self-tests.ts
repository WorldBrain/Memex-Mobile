import StorageManager from '@worldbrain/storex'
import { Services } from './services/types'
import { Storage } from './storage/types'
import { insertIntegrationTestData } from './tests/shared-fixtures/integration'

export function createSelfTests(dependencies: {
    services: Services
    storage: Storage
}) {
    const { services, storage } = dependencies
    return {
        initialSyncSend: async () => {
            await clearDb(storage.manager)
            await insertIntegrationTestData(dependencies)
            return services.sync.initialSync.requestInitialSync()
        },
        initialSyncReceive: async (options: { initialMessage: string }) => {
            await clearDb(storage.manager)
            await services.sync.initialSync.answerInitialSync(options)
            await services.sync.initialSync.waitForInitialSync()
            console['log'](
                'After initial Sync, got these lists',
                await storage.manager.collection('customLists').findObjects({}),
            )
        },
    }
}

async function clearDb(storageManager: StorageManager) {
    for (const collectionName of Object.keys(
        storageManager.registry.collections,
    )) {
        await storageManager.collection(collectionName).deleteObjects({})
    }
}
