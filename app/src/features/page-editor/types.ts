export type EditorMode = 'tags' | 'collections' | 'notes'

export interface Note {
    url: string
    pageTitle: string
    pageUrl: string
    body: string
    comment: string
    selector: any
    createdWhen: Date
    lastEdited: Date
}

export interface Bookmark {
    url: string
    createdAt: Date
}

export interface ListEntry {
    listId: string
    url: string
    createdAt: Date
}
