// import { createConnection, getRepository, ManyToMany, JoinTable, ManyToOne } from 'typeorm/browser';
// import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm/browser";
import StorageManager from '@worldbrain/storex'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'

export async function runDatabaseTest() {
    const backend = new TypeORMStorageBackend({ connectionOptions: { type: 'sqlite', database: ':memory:' } })
    const storageManager = new StorageManager({ backend })
    storageManager.registry.registerCollections({
        post: {
            version: new Date(),
            fields: {
                title: { type: 'string' },
                text: { type: 'string' }
            }
        },
    })
    await storageManager.finishInitialization()

    const { object } = await storageManager.collection('post').createObject({ title: 'Post title', body: 'Post body' })
    console.log('Created object', object)

    const loadedPost = await storageManager.collection('post').findObject({ id: object.id })
    console.log('Found object', loadedPost)
}
