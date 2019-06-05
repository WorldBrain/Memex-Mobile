import StorageManager from '@worldbrain/storex'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'
import { StorageBackendType, Storage } from "./types";

export interface CreateStorageOptions {
    backendType : StorageBackendType
}

export async function createStorage(options : CreateStorageOptions) : Promise<Storage> {
    const backend = new TypeORMStorageBackend({ connectionOptions: { type: 'react-native', location: 'default', database: ':memory:' } })
    const storageManager = new StorageManager({ backend })
    // storageManager.registry.registerCollections({
    //     post: {
    //         version: new Date(),
    //         fields: {
    //             title: { type: 'string' },
    //             body: { type: 'string' }
    //         }
    //     },
    // })
    await storageManager.finishInitialization()
    // await backend.connection.dropDatabase()
    // await storageManager.backend.migrate()

    // const { object } = await storageManager.collection('post').createObject({ title: 'Post title', body: 'Post body' })
    // console.log('Created object', object)

    // const loadedPosts = await storageManager.collection('post').findObjects({})
    // console.log('Found objects', loadedPosts)

    return {
        manager: storageManager
    }
}