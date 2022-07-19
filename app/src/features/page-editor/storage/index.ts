import {
    StorageModule,
    StorageModuleConfig,
    StorageModuleConstructorArgs,
} from '@worldbrain/storex-pattern-modules'
import type { URLNormalizer } from '@worldbrain/memex-url-utils'
import {
    COLLECTION_DEFINITIONS,
    COLLECTION_NAMES,
} from '@worldbrain/memex-common/lib/storage/modules/annotations/constants'
import type { Note } from '../types'
import omit from 'lodash/omit'
import type { AnnotationPrivacyLevel } from '@worldbrain/memex-common/lib/content-sharing/client-storage/types'

type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

type NoteCreate = Omit<Note, 'url'>

export interface NoteOpArgs {
    url: string
}

export interface Props extends StorageModuleConstructorArgs {
    normalizeUrl: URLNormalizer
    createDefaultAnnotPrivacyLevel: (annotationUrl: string) => Promise<void>
    findAnnotPrivacyLevels: (
        annotationUrls: string[],
    ) => Promise<{ [annotationUrl: string]: AnnotationPrivacyLevel }>
}

export class PageEditorStorage extends StorageModule {
    static NOTE_COLL = COLLECTION_NAMES.annotation
    static BOOKMARK_COLL = COLLECTION_NAMES.bookmark

    constructor(private deps: Props) {
        super(deps)
    }

    getConfig = (): StorageModuleConfig => {
        return {
            collections: {
                // NOTE: annotListEntries are handled in MetaPicker storage module
                ...omit(COLLECTION_DEFINITIONS, COLLECTION_NAMES.listEntry),
            },
            operations: {
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
                findNotes: {
                    operation: 'findObjects',
                    collection: PageEditorStorage.NOTE_COLL,
                    args: {
                        url: { $in: '$urls:string' },
                    },
                },
                findNotesForPage: {
                    operation: 'findObjects',
                    collection: PageEditorStorage.NOTE_COLL,
                    args: {
                        pageUrl: '$url:string',
                    },
                },
                updateNoteText: {
                    operation: 'updateObject',
                    collection: PageEditorStorage.NOTE_COLL,
                    args: [
                        { url: '$url:string' },
                        {
                            comment: '$text:string',
                            lastEdited: '$lastEdited:date',
                        },
                    ],
                },
                deleteNote: {
                    operation: 'deleteObject',
                    collection: PageEditorStorage.NOTE_COLL,
                    args: {
                        url: '$url:string',
                    },
                },
                deleteNotesForPage: {
                    operation: 'deleteObjects',
                    collection: PageEditorStorage.NOTE_COLL,
                    args: {
                        pageUrl: '$url:string',
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
        }
    }

    private createAnnotationUrl = (args: {
        pageUrl: string
        timestamp: number
    }) => `${args.pageUrl}/#${args.timestamp}`

    async createNote(
        note: NoteCreate,
        customTimestamp = Date.now(),
        opts?: { skipPrivacyLevelCreation?: boolean },
    ): Promise<{ annotationUrl: string }> {
        const pageUrl = this.deps.normalizeUrl(note.pageUrl)
        const annotationUrl = this.createAnnotationUrl({
            pageUrl,
            timestamp: customTimestamp,
        })

        await this.operation('createNote', {
            createdWhen: new Date(customTimestamp),
            lastEdited: new Date(customTimestamp),
            pageTitle: note.pageTitle,
            comment: note.comment,
            pageUrl,
            url: annotationUrl,
        })

        if (!opts?.skipPrivacyLevelCreation) {
            await this.deps.createDefaultAnnotPrivacyLevel(annotationUrl)
        }
        return { annotationUrl }
    }

    async createAnnotation(
        annotation: RequiredBy<NoteCreate, 'selector' | 'body'>,
        customTimestamp = Date.now(),
        opts?: { skipPrivacyLevelCreation?: boolean },
    ): Promise<{ annotationUrl: string }> {
        const pageUrl = this.deps.normalizeUrl(annotation.pageUrl)
        const annotationUrl = this.createAnnotationUrl({
            pageUrl,
            timestamp: customTimestamp,
        })

        await this.operation('createNote', {
            createdWhen: new Date(customTimestamp),
            lastEdited: new Date(customTimestamp),
            pageTitle: annotation.pageTitle,
            selector: annotation.selector,
            comment: annotation.comment,
            body: annotation.body,
            pageUrl,
            url: annotationUrl,
        })

        if (!opts?.skipPrivacyLevelCreation) {
            await this.deps.createDefaultAnnotPrivacyLevel(annotationUrl)
        }
        return { annotationUrl }
    }

    async deleteNotesForPage({ url }: { url: string }) {
        const pageUrl = this.deps.normalizeUrl(url)

        return this.operation('deleteNotesForPage', { url: pageUrl })
    }

    async updateNoteText(args: {
        url: string
        text: string
        lastEdited?: Date
    }) {
        return this.operation('updateNoteText', {
            lastEdited: new Date(),
            ...args,
        })
    }

    async findNote({ url }: NoteOpArgs): Promise<Note | null> {
        const note = await this.operation('findNote', { url })
        if (!note) {
            return null
        }

        return {
            ...note,
            isStarred: false,
        }
    }

    async findNotes({ urls }: { urls: string[] }): Promise<Note[]> {
        return this.operation('findNotes', { urls })
    }

    async findNotesByPage({
        url,
        withPrivacyLevels,
    }: NoteOpArgs & { withPrivacyLevels?: boolean }): Promise<Note[]> {
        url = this.deps.normalizeUrl(url)

        const notes: Note[] = await this.operation('findNotesForPage', { url })
        const privacyLevels = withPrivacyLevels
            ? await this.deps.findAnnotPrivacyLevels(notes.map((n) => n.url))
            : {}

        for (const note of notes) {
            note.isStarred = false
            note.privacyLevel = privacyLevels[note.url]?.privacyLevel
        }

        return notes
    }

    async findAnnotations({
        url,
    }: NoteOpArgs): Promise<RequiredBy<Note, 'body' | 'selector'>[]> {
        const notes = await this.findNotesByPage({ url })

        return notes.filter(
            (note) => note.body?.length && note.selector != null,
        ) as any
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

    async deleteNoteByUrl({ url }: NoteOpArgs): Promise<void> {
        return this.operation('deleteNote', { url })
    }
}
