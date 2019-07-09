import {
    StorageModule,
    StorageModuleConfig,
} from '@worldbrain/storex-pattern-modules'

export class MetaPickerStorage extends StorageModule {
    static TAG_COLL = 'tag'
    static LIST_COLL = 'list'
    static ENTRY_COLL = 'listPageEntry'

    getConfig = (): StorageModuleConfig => ({
        collections: {
            [MetaPickerStorage.TAG_COLL]: {
                version: new Date('2019-07-09'),
                fields: {},
            },
            [MetaPickerStorage.LIST_COLL]: {
                version: new Date('2019-07-09'),
                fields: {},
            },
            [MetaPickerStorage.ENTRY_COLL]: {
                version: new Date('2019-07-09'),
                fields: {},
            },
        },
        operations: {
            createList: {
                operation: 'createObject',
                collection: MetaPickerStorage.LIST_COLL,
            },
            createListEntry: {
                operation: 'createObject',
                collection: MetaPickerStorage.ENTRY_COLL,
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
                collection: MetaPickerStorage.ENTRY_COLL,
                args: {
                    url: '$url:string',
                },
            },
            findEntriesForList: {
                operation: 'findObjects',
                collection: MetaPickerStorage.ENTRY_COLL,
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
            deleteListEntry: {
                operation: 'deleteObject',
                collection: MetaPickerStorage.ENTRY_COLL,
                args: {
                    listId: '$listId:number',
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
