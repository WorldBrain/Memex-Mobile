import { NoteEditMode } from 'src/features/overview/ui/screens/note-editor/types'
import { DashboardFilterType } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import { Anchor } from 'src/content-script/types'

export type MainNavigatorRoutes = keyof MainNavigatorParamList
export type MainNavigatorParamList = {
    DebugConsole: undefined
    SettingsMenu: undefined
    MVPOverview: undefined
    Onboarding: undefined
    Pairing: undefined
    Login: undefined
    Sync: undefined
    ListsFilter: {
        selectedList: string
    }
    Dashboard:
        | {
              selectedList?: string
              filterType?: DashboardFilterType
          }
        | undefined
    PageEditor: {
        readerScrollPercent?: number
        selectedList?: string
        pageUrl: string
        mode: EditorMode
    }
    NoteEditor: {
        mode: NoteEditMode
        pageUrl: string
        pageTitle?: string
        anchor?: Anchor
        selectedList?: string
        noteUrl?: string
        noteText?: string
        highlightText?: string
        readerScrollPercent?: number
    }
    Reader: {
        url: string
        title: string
        scrollPercent?: number
    }
}

export type ShareNavigatorRoutes = keyof ShareNavigatorParamList
export type ShareNavigatorParamList = {
    ShareModal: undefined
    Login: undefined
}
