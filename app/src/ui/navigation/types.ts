import { NoteEditMode } from 'src/features/overview/ui/screens/note-editor/types'
import { EditorMode } from 'src/features/page-editor/types'
import { Anchor } from 'src/content-script/types'
import { UIPageWithNotes } from 'src/features/overview/types'

export type MainNavigatorRoutes = keyof MainNavigatorParamList
export type MainNavigatorParamList = {
    DebugConsole: undefined
    SettingsMenu: undefined
    Pairing: undefined
    Sync: undefined
    CloudSync: undefined
    Onboarding: { redoOnboarding?: boolean } | undefined
    Login:
        | {
              nextRoute?: keyof MainNavigatorParamList
          }
        | undefined
    ListsFilter: {
        selectedList: string
    }
    Dashboard: { selectedList: string } | undefined
    PageEditor: {
        pageUrl: string
        mode: EditorMode
        /** Affords sending page changes that occur in this route back up to parent route. */
        updatePage: (page: UIPageWithNotes) => void
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
        /** Affords sending page changes that occur in this route back up to parent route. */
        updatePage: (page: UIPageWithNotes) => void
    }
}

export type ShareNavigatorRoutes = keyof ShareNavigatorParamList
export type ShareNavigatorParamList = {
    ShareModal: undefined
    Login: undefined
}
