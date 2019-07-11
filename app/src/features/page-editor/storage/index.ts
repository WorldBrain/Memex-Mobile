import {
    StorageModule,
    StorageModuleConfig,
} from '@worldbrain/storex-pattern-modules'

export class PageEditorStorage extends StorageModule {
    static NOTE_COLL = 'annotations'
    static BOOKMARK_COLL = 'annotBookmarks'
    static LIST_ENTRY_COLL = 'annotListEntries'

    getConfig = (): StorageModuleConfig => ({
        collections: {
            [PageEditorStorage.NOTE_COLL]: {
                version: new Date('2019-07-09'),
                fields: {
                    url: { type: 'string' },
                    pageTitle: { type: 'text' },
                    pageUrl: { type: 'url' },
                    body: { type: 'text' },
                    comment: { type: 'text' },
                    selector: { type: 'json' },
                    createdWhen: { type: 'datetime' },
                    lastEdited: { type: 'datetime' },
                },
                indices: [
                    { field: 'url', pk: true },
                    { field: 'pageUrl' },
                    { field: 'pageTitle' },
                    { field: 'body' },
                    { field: 'createdWhen' },
                    { field: 'lastEdited' },
                    { field: 'comment' },
                ],
            },
            [PageEditorStorage.BOOKMARK_COLL]: {
                version: new Date('2019-07-09'),
                fields: {
                    url: { type: 'string' },
                    createdAt: { type: 'datetime' },
                },
                indices: [{ field: 'url', pk: true }, { field: 'createdAt' }],
            },
            [PageEditorStorage.LIST_ENTRY_COLL]: {
                version: new Date('2019-07-10'),
                fields: {
                    listId: { type: 'string' },
                    url: { type: 'string' },
                    createdAt: { type: 'datetime' },
                },
                indices: [
                    { field: ['listId', 'url'], pk: true },
                    { field: 'listId' },
                    { field: 'url' },
                ],
            },
        },
        operations: {
            addNoteToList: {
                operation: 'createObject',
                collection: PageEditorStorage.LIST_ENTRY_COLL,
            },
            createNote: {
                operation: 'createObject',
                collection: PageEditorStorage.NOTE_COLL,
            },

            findNote: {
                operation: 'findObject',
                collection: PageEditorStorage.NOTE_COLL,
                args: {
                    url: '$url:string',
                },
            },
            findNotesForPage: {
                operation: 'findObjects',
                collection: PageEditorStorage.NOTE_COLL,
                args: {
                    pageUrl: '$url:string',
                },
            },
            findEntriesForList: {
                operation: 'findObjects',
                collection: PageEditorStorage.LIST_ENTRY_COLL,
                args: {
                    listId: '$listId:number',
                },
            },
            findEntriesForNote: {
                operation: 'findObjects',
                collection: PageEditorStorage.LIST_ENTRY_COLL,
                args: {
                    url: '$url:string',
                },
            },
            deleteNote: {
                operation: 'deleteObject',
                collection: PageEditorStorage.NOTE_COLL,
                args: {
                    url: '$url:string',
                },
            },

            deleteNoteFromList: {
                operation: 'deleteObject',
                collection: PageEditorStorage.LIST_ENTRY_COLL,
                args: {
                    url: '$url:string',
                    listId: '$listId:number',
                },
            },
            deleteEntriesForList: {
                operation: 'deleteObjects',
                collection: PageEditorStorage.LIST_ENTRY_COLL,
                args: {
                    listId: '$listId:number',
                },
            },
            deleteEntriesForNote: {
                operation: 'deleteObjects',
                collection: PageEditorStorage.LIST_ENTRY_COLL,
                args: {
                    url: '$url:string',
                },
            },
            starNote: {
                operation: 'createObject',
                collection: PageEditorStorage.BOOKMARK_COLL,
            },
            unstarNote: {
                operation: 'deleteObject',
                collection: PageEditorStorage.BOOKMARK_COLL,
                args: {
                    url: '$url:string',
                },
            },
        },
    })
}
