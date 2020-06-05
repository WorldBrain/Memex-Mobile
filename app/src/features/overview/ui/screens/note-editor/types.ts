export type NoteEditMode = 'create' | 'update'

export interface NoteEditorNavigationParams {
    mode: NoteEditMode
    pageUrl: string
    selectedList?: string
    noteUrl?: string
    noteText?: string
    highlightText?: string
}
