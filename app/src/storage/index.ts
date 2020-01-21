import { ConnectionOptions } from 'typeorm'
import StorageManager from '@worldbrain/storex'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'
import { registerModuleMapCollections } from '@worldbrain/storex-pattern-modules'
import { extractUrlParts, normalizeUrl } from '@worldbrain/memex-url-utils'

import defaultConnectionOpts from './default-connection-opts'
import { Storage } from './types'
import { createStorexPlugins } from '@worldbrain/memex-storage/lib/mobile-app/plugins'
import { SettingsStorage } from 'src/features/settings/storage'
import { OverviewStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/overview/storage'
import { MetaPickerStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/storage'
import { PageEditorStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/page-editor/storage'
import { Services } from 'src/services/types'
import { createServerStorageManager } from './server'
import { createSharedSyncLog } from 'src/services/sync/shared-sync-log'
import {
    MemexClientSyncLogStorage,
    MemexSyncInfoStorage,
} from 'src/features/sync/storage'

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

    const backend = new TypeORMStorageBackend({ connectionOptions })

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
}) {
    options.storage.manager.setMiddleware([
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
