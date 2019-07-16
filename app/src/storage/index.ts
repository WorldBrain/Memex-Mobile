import { ConnectionOptions } from 'typeorm'
import StorageManager from '@worldbrain/storex'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'
import { registerModuleMapCollections } from '@worldbrain/storex-pattern-modules'

import { Storage, StorageModules } from './types'
import { OverviewStorage } from 'src/features/overview/storage'
import { MetaPickerStorage } from 'src/features/meta-picker/storage'
import { PageEditorStorage } from 'src/features/page-editor/storage'

export interface CreateStorageOptions {
    typeORMConnectionOpts: ConnectionOptions
}

export async function createStorage({
    typeORMConnectionOpts: connectionOptions,
}: CreateStorageOptions): Promise<Storage> {
    const backend = new TypeORMStorageBackend({ connectionOptions })
    const storageManager = new StorageManager({ backend })

    const modules: StorageModules = {
        overview: new OverviewStorage({ storageManager }),
        metaPicker: new MetaPickerStorage({ storageManager }),
        pageEditor: new PageEditorStorage({ storageManager }),
    }

    registerModuleMapCollections(storageManager.registry, modules as any)
    await storageManager.finishInitialization()

    await backend.connection.dropDatabase()
    if (
        !(await backend.connection.createQueryRunner().getDatabases()).includes(
            connectionOptions.database as string,
        )
    ) {
        await storageManager.backend.migrate()
    }

    return {
        manager: storageManager,
        modules,
    }
}
