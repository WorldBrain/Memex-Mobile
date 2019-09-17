import {
    StorageModule,
    StorageModuleConfig,
    StorageModuleConstructorArgs,
} from '@worldbrain/storex-pattern-modules'

import { Note } from '../types'
import { URLNormalizer } from 'src/utils/normalize-url/types'

export interface NoteOpArgs {
    url: string
}

export interface Props extends StorageModuleConstructorArgs {
    normalizeUrls: URLNormalizer
}

export class PageEditorStorage extends StorageModule {
    static NOTE_COLL = 'annotations'
    static BOOKMARK_COLL = 'annotBookmarks'
    static LIST_ENTRY_COLL = 'annotListEntries'

    private normalizeUrl: URLNormalizer

    constructor({ normalizeUrls, ...args }: Props) {
        super(args)

        this.normalizeUrl = normalizeUrls
    }

    getConfig = (): StorageModuleConfig => ({
        collections: {
            [PageEditorStorage.NOTE_COLL]: {
                version: new Date('2019-07-09'),
                fields: {
                    url: { type: 'string' },
                    pageTitle: { type: 'text' },
                    pageUrl: { type: 'url' },
                    body: { type: 'text', optional: true },
                    comment: { type: 'text', optional: true },
                    // TODO: This type differs from corresponding Memex ext type (not supported in react native)
                    selector: { type: 'string', optional: true },
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
            findBookmark: {
                operation: 'findObject',
                collection: PageEditorStorage.BOOKMARK_COLL,
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

    private createAnnotationUrl = ({
        pageUrl,
        timestamp = Date.now(),
    }: {
        pageUrl: string
        timestamp?: number
    }) =>
        this.normalizeUrl(`${pageUrl}/#${timestamp}`, {
            stripHash: false,
            removeTrailingSlash: false,
        })

    createNote(note: Omit<Note, 'url'>, customTimestamp = Date.now()) {
        const created = new Date()

        return this.operation('createNote', {
            createdWhen: created,
            lastEdited: created,
            ...note,
            url: this.createAnnotationUrl({
                pageUrl: note.pageUrl,
                timestamp: customTimestamp,
            }),
            pageUrl: this.normalizeUrl(note.pageUrl),
        })
    }

    async findNote({ url }: NoteOpArgs): Promise<Note | null> {
        const note = await this.operation('findNote', { url })
        if (!note) {
            return null
        }

        const bookmark = await this.operation('findBookmark', { url })
        return {
            ...note,
            isStarred: !!bookmark,
        }
    }

    starNote({
        url,
        createdAt = new Date(),
    }: NoteOpArgs & { createdAt?: Date }) {
        return this.operation('starNote', { url, createdAt })
    }

    unstarNote({ url }: NoteOpArgs) {
        return this.operation('unstarNote', { url })
    }
}
