import { NoteEditMode } from 'src/features/overview/ui/screens/note-editor/types'
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
    Dashboard: { selectedList: string } | undefined
    PageEditor: {
        pageUrl: string
        mode: EditorMode
    }
    NoteEditor: {
        mode: NoteEditMode
        pageUrl: string
        pageTitle?: string
        anchor?: Anchor
        noteUrl?: string
        noteText?: string
        highlightText?: string
    }
    Reader: {
        url: string
        title: string
    }
}

export type ShareNavigatorRoutes = keyof ShareNavigatorParamList
export type ShareNavigatorParamList = {
    ShareModal: undefined
    Login: undefined
}
