import { Anchor } from 'src/content-script/types'

export type NoteEditMode = 'create' | 'update'

export type PreviousRoute = 'PageEditor' | 'Reader'

export interface NoteEditorNavigationParams {
    mode: NoteEditMode
    pageUrl: string
    previousRoute: PreviousRoute
    pageTitle?: string
    anchor?: Anchor
    selectedList?: string
    noteUrl?: string
    noteText?: string
    highlightText?: string
}
