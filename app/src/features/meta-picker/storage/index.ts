import {
    StorageModule,
    StorageModuleConfig,
} from '@worldbrain/storex-pattern-modules'

import { Tag, List, ListEntry } from '../types'

export class MetaPickerStorage extends StorageModule {
    static TAG_COLL = 'tags'
    static LIST_COLL = 'customLists'
    static LIST_ENTRY_COLL = 'pageListEntries'
    /** This exists to mimic behavior implemented in memex WebExt; Storex auto-PK were not used for whatever reason. */
    static generateListId = () => Date.now()

    getConfig = (): StorageModuleConfig => ({
        collections: {
            [MetaPickerStorage.TAG_COLL]: {
                version: new Date('2019-07-09'),
                fields: {
                    url: { type: 'string' },
                    name: { type: 'string' },
                },
                indices: [
                    { field: ['name', 'url'], pk: true },
                    { field: 'name' },
                    { field: 'url' },
                ],
            },
            [MetaPickerStorage.LIST_COLL]: {
                version: new Date('2019-07-09'),
                fields: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    isDeletable: { type: 'boolean', optional: true },
                    isNestable: { type: 'boolean', optional: true },
                    createdAt: { type: 'datetime' },
                },
                indices: [
                    { field: 'id', pk: true },
                    { field: 'name', unique: true },
                    { field: 'isDeletable' },
                    { field: 'isNestable' },
                    { field: 'createdAt' },
                ],
            },
            [MetaPickerStorage.LIST_ENTRY_COLL]: {
                version: new Date('2019-07-09'),
                fields: {
                    listId: { type: 'string' },
                    pageUrl: { type: 'string' },
                    fullUrl: { type: 'string' },
                    createdAt: { type: 'datetime' },
                },
                indices: [
                    { field: ['listId', 'pageUrl'], pk: true },
                    { field: 'listId' },
                    { field: 'pageUrl' },
                ],
            },
        },
        operations: {
            createList: {
                operation: 'createObject',
                collection: MetaPickerStorage.LIST_COLL,
            },
            createListEntry: {
                operation: 'createObject',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
            },
            createTag: {
                operation: 'createObject',
                collection: MetaPickerStorage.TAG_COLL,
            },
            findListsByName: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_COLL,
                args: {
                    name: '$name:string',
                },
            },
            findTagsByPage: {
                operation: 'findObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    url: '$url:string',
                },
            },
            findTagsByName: {
                operation: 'findObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    name: '$name:string',
                },
            },
            findEntriesByPage: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    pageUrl: '$url:string',
                },
            },
            findEntriesByList: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    listId: '$listId:number',
                },
            },
            deleteList: {
                operation: 'deleteObject',
                collection: MetaPickerStorage.LIST_COLL,
                args: {
                    id: '$listId:number',
                },
            },
            deletePageFromList: {
                operation: 'deleteObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    listId: '$listId:number',
                    pageUrl: '$url:string',
                },
            },
            deleteEntriesForList: {
                operation: 'deleteObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    listId: '$listId:number',
                },
            },
            deleteEntriesForPage: {
                operation: 'deleteObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    pageUrl: '$url:string',
                },
            },
            deleteTag: {
                operation: 'deleteObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    name: '$name:string',
                    url: '$url:string',
                },
            },
            deleteTagsByPage: {
                operation: 'deleteObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    url: '$url:string',
                },
            },
        },
    })

    createTag(tag: Tag) {
        return this.operation('createTag', tag)
    }

    createList(list: Omit<List, 'id' | 'createdAt'>) {
        return this.operation('createList', {
            id: MetaPickerStorage.generateListId(),
            createdAt: new Date(),
            ...list,
        })
    }

    createPageListEntry(entry: {
        fullUrl: string
        pageUrl: string
        listId: number
    }) {
        return this.operation('createListEntry', {
            createdAt: new Date(),
            ...entry,
        })
    }

    findTagsByPage({ url }: { url: string }): Promise<Tag[]> {
        return this.operation('findTagsByPage', { url })
    }

    findTagsByName({ name }: { name: string }): Promise<Tag[]> {
        return this.operation('findTagsByName', { name })
    }

    findListsByName({ name }: { name: string }): Promise<List[]> {
        return this.operation('findListsByName', { name })
    }

    findPageListEntriesByPage({ url }: { url: string }): Promise<ListEntry[]> {
        return this.operation('findEntriesByPage', { url })
    }

    findPageListEntriesByList({
        listId,
    }: {
        listId: number
    }): Promise<ListEntry[]> {
        return this.operation('findEntriesByList', { listId })
    }

    async deleteList({ listId }: { listId: number }) {
        await this.deletePageListEntriesByList({ listId })
        await this.operation('deleteList', { listId })
    }

    deletePageListEntriesByList({ listId }: { listId: number }) {
        return this.operation('deleteEntriesForList', { listId })
    }

    deletePageEntryFromList(entry: { listId: number; url: string }) {
        return this.operation('deletePageFromList', { entry })
    }

    deleteTag(tag: Tag) {
        return this.operation('deleteTag', tag)
    }

    deleteTagsByPage({ url }: { url: string }) {
        return this.operation('deleteTagsByPage', { url })
    }
}
