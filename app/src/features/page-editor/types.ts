export type EditorMode = 'tags' | 'collections' | 'notes'

export interface Note {
    url: string
    pageTitle: string
    pageUrl: string
    /** Represents the highlighted text in a highlight annotation. */
    body?: string
    /** Represents the user's comment in any type of annotation. */
    comment?: string
    selector?: any
    lastEdited?: Date
    createdWhen?: Date
    isStarred?: boolean
}

export interface Bookmark {
    url: string
    createdAt: Date
}

export interface ListEntry {
    listId: string
    url: string
    createdAt: Date
    pageUrl: string
}
