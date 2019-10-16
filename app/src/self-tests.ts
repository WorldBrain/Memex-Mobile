import StorageManager from '@worldbrain/storex'
import { Services } from './services/types'
import { Storage } from './storage/types'
import { insertIntegrationTestData } from './tests/shared-fixtures/integration'
import { MemoryAuthService } from './services/auth/memory'

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
            console.log('receive start')
            await clearDb(storage.manager)
            console.log('receive cleared')
            await services.sync.initialSync.answerInitialSync(options)
            console.log('receive answered')
            await services.sync.initialSync.waitForInitialSync()
            console['log'](
                'After initial Sync, got these lists',
                await storage.manager.collection('customLists').findObjects({}),
            )
        },
        incrementalSyncSend: async (userId: string) => {
            await clearDb(storage.manager)
            const auth = services.auth as MemoryAuthService
            auth.setUser({ id: userId })
            await services.sync.continuousSync.options.settingStore.storeSetting(
                'deviceId',
                null,
            )

            // await serverStorageManager.collection('sharedSyncLogEntryBatch').deleteObjects({})
            await services.sync.continuousSync.initDevice()
            await services.sync.continuousSync.setupContinuousSync()
            await insertIntegrationTestData(dependencies)
            await services.sync.continuousSync.forceIncrementalSync()
        },
        incrementalSyncReceive: async (userId: string) => {
            await clearDb(storage.manager)
            const auth = services.auth as MemoryAuthService
            auth.setUser({ id: userId })
            await services.sync.continuousSync.options.settingStore.storeSetting(
                'deviceId',
                null,
            )
            // await serverStorageManager.collection('sharedSyncLogEntryBatch').deleteObjects({})

            await services.sync.continuousSync.initDevice()
            await services.sync.continuousSync.setupContinuousSync()
            await services.sync.continuousSync.forceIncrementalSync()
            console['log'](
                'After incremental Sync, got these lists',
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
