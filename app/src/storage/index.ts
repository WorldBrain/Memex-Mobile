import { ConnectionOptions } from 'typeorm'
import StorageManager from '@worldbrain/storex'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'
import { registerModuleMapCollections } from '@worldbrain/storex-pattern-modules'

import defaultConnectionOpts from './default-connection-opts'
import { Storage } from './types'
import { OverviewStorage } from 'src/features/overview/storage'
import { MetaPickerStorage } from 'src/features/meta-picker/storage'
import { PageEditorStorage } from 'src/features/page-editor/storage'
import normalizeUrls from 'src/utils/normalize-url'

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
    const storageManager = new StorageManager({ backend })

    const modules = {
        overview: new OverviewStorage({ storageManager, normalizeUrls }),
        metaPicker: new MetaPickerStorage({ storageManager }),
        pageEditor: new PageEditorStorage({ storageManager }),
    }

    registerModuleMapCollections(storageManager.registry, modules)
    await storageManager.finishInitialization()
    await storageManager.backend.migrate()

    return {
        manager: storageManager,
        modules,
    }
}
