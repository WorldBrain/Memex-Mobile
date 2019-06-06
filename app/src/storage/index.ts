import StorageManager from '@worldbrain/storex'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'
import { StorageBackendType, Storage, StorageModules } from "./types";
import { TodoListStorage } from 'src/features/example/storage';
import { registerModuleMapCollections, StorageModule } from '@worldbrain/storex-pattern-modules';

export interface CreateStorageOptions {
    backendType : StorageBackendType
    dbName : string
}

export async function createStorage(options : CreateStorageOptions) : Promise<Storage> {
    const backend = new TypeORMStorageBackend({ connectionOptions: { type: 'react-native', location: 'default', database: options.dbName } })
    const storageManager = new StorageManager({ backend })

    const modules : StorageModules = {
        todoList: new TodoListStorage({ storageManager })
    }

    registerModuleMapCollections(storageManager.registry, modules as any)
    await storageManager.finishInitialization()

    await backend.connection.dropDatabase()
    if (!(await backend.connection.createQueryRunner().getDatabases()).includes(options.dbName)) {
        await storageManager.backend.migrate()
    }

    const list = await modules.todoList.getOrCreateDefaultList({ defaultLabel: 'Default list' })
    console.log('Default list', list)

    return {
        manager: storageManager,
        modules,
    }
}