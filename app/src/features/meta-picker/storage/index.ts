import {
    StorageModule,
    StorageModuleConfig,
} from '@worldbrain/storex-pattern-modules'

export class MetaPickerStorage extends StorageModule {
    static TAG_COLL = 'tags'
    static LIST_COLL = 'customLists'
    static LIST_ENTRY_COLL = 'pageListEntries'

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
                    isDeletable: { type: 'boolean' },
                    isNestable: { type: 'boolean' },
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
            findTagsForPage: {
                operation: 'findObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    url: '$url:string',
                },
            },
            findTagsForName: {
                operation: 'findObjects',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    name: '$name:string',
                },
            },
            findEntriesForPage: {
                operation: 'findObjects',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    url: '$url:string',
                },
            },
            findEntriesForList: {
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
                    listId: '$listId:number',
                },
            },
            deletePageFromList: {
                operation: 'deleteObject',
                collection: MetaPickerStorage.LIST_ENTRY_COLL,
                args: {
                    listId: '$listId:number',
                    url: '$url:string',
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
                    url: '$url:string',
                },
            },
            deleteTag: {
                operation: 'deleteObject',
                collection: MetaPickerStorage.TAG_COLL,
                args: {
                    name: '$name:string',
                    url: '$url:string',
                },
            },
        },
    })
}
