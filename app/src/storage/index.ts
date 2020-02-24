import { ConnectionOptions } from 'typeorm'
import StorageManager from '@worldbrain/storex'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'
import { registerModuleMapCollections } from '@worldbrain/storex-pattern-modules'
import { ChangeWatchMiddleware } from '@worldbrain/storex-middleware-change-watcher'
import { extractUrlParts, normalizeUrl } from '@worldbrain/memex-url-utils'
import { createStorexPlugins } from '@worldbrain/memex-storage/lib/mobile-app/plugins'
import { OverviewStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/overview/storage'
import { MetaPickerStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/storage'
import { PageEditorStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/page-editor/storage'
import { SYNCED_COLLECTIONS } from '@worldbrain/memex-common/lib/sync/constants'

import defaultConnectionOpts from './default-connection-opts'
import { Storage } from './types'
import { SettingsStorage } from 'src/features/settings/storage'
import { Services } from 'src/services/types'
import { createServerStorageManager } from './server'
import { createSharedSyncLog } from 'src/services/sync/shared-sync-log'
import {
    MemexClientSyncLogStorage,
    MemexSyncInfoStorage,
} from 'src/features/sync/storage'
import { StorageOperationEvent } from '@worldbrain/storex-middleware-change-watcher/lib/types'

export interface CreateStorageOptions {
    typeORMConnectionOpts: ConnectionOptions
}

export async function createStorage({
    typeORMConnectionOpts,
}: CreateStorageOptions): Promise<Storage> {
    const connectionOptions = {
        ...defaultConnectionOpts,
        ...typeORMConnectionOpts,
    } as ConnectionOptions

    const backend = new TypeORMStorageBackend({
        connectionOptions,
        legacyMemexCompatibility: true,
    })

    for (const plugin of createStorexPlugins()) {
        backend.use(plugin)
    }

    const storageManager = new StorageManager({ backend })

    const modules: Storage['modules'] = {
        overview: new OverviewStorage({
            storageManager,
            normalizeUrl,
            extractUrlParts,
        }),
        metaPicker: new MetaPickerStorage({ storageManager, normalizeUrl }),
        pageEditor: new PageEditorStorage({ storageManager, normalizeUrl }),
        clientSyncLog: new MemexClientSyncLogStorage({ storageManager }),
        syncInfo: new MemexSyncInfoStorage({ storageManager }),
        settings: new SettingsStorage({ storageManager }),
    }

    registerModuleMapCollections(storageManager.registry, modules as any)
    await storageManager.finishInitialization()
    await storageManager.backend.migrate()

    return {
        manager: storageManager,
        modules,
    }
}

export async function setStorageMiddleware(options: {
    storage: Storage
    services: Services
    enableAutoSync?: boolean
    extraPostChangeWatcher?: (
        context: StorageOperationEvent<'post'>,
    ) => void | Promise<void>
}) {
    const syncedCollections = new Set(SYNCED_COLLECTIONS)
    options.storage.manager.setMiddleware([
        new ChangeWatchMiddleware({
            storageManager: options.storage.manager,
            shouldWatchCollection: collection =>
                syncedCollections.has(collection),
            postprocessOperation: async context => {
                if (options.enableAutoSync) {
                    await options.services.sync.handleStorageChange(context)
                }
                if (options.extraPostChangeWatcher) {
                    await options.extraPostChangeWatcher(context)
                }
            },
        }),
        await options.services.sync.createSyncLoggingMiddleware(),
    ])
}

export async function createServerStorage() {
    const manager = createServerStorageManager()
    const sharedSyncLog = createSharedSyncLog(manager)
    registerModuleMapCollections(manager.registry, {
        sharedSyncLog,
    })
    await manager.finishInitialization()

    return {
        manager,
        modules: {
            sharedSyncLog,
        },
    }
}
