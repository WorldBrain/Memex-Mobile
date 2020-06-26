import { Anchor } from 'src/content-script/types'

export type NoteEditMode = 'create' | 'update'

export type PreviousRoute = 'PageEditor' | 'Reader'

export interface NoteEditorNavigationParams {
    mode: NoteEditMode
    pageUrl: string
    previousRoute: PreviousRoute
    /** TODO: This is a hack - fix the navigation lib so we don't have to manage this state */
    __prevPreviousRoute?: PreviousRoute
    pageTitle?: string
    anchor?: Anchor
    selectedList?: string
    noteUrl?: string
    noteText?: string
    highlightText?: string
    readerScrollPercent?: number
}
