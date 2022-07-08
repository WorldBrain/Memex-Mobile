import { NoteEditMode } from 'src/features/overview/ui/screens/note-editor/types'
import { EditorMode } from 'src/features/page-editor/types'
import { Anchor } from 'src/content-script/types'
import { UIPageWithNotes } from 'src/features/overview/types'

export type MainNavigatorRoutes = keyof MainNavigatorParamList
export type MainNavigatorParamList = {
    DebugConsole: undefined
    SettingsMenu: undefined
    Pairing: undefined
    CloudSync: { shouldWipeDBFirst?: boolean } | undefined
    Onboarding: { redoOnboarding?: boolean } | undefined
    Login:
        | {
              nextRoute?: keyof MainNavigatorParamList
          }
        | undefined
    ListsFilter: {
        selectedListId: number
    }
    Dashboard: { selectedListId: number } | undefined
    PageEditor: {
        pageUrl: string
        mode: EditorMode
        /** Affords sending page changes that occur in this route back up to parent route. */
        updatePage: (page: UIPageWithNotes) => void
    }
    NoteEditor: {
        pageTitle?: string
        anchor?: Anchor
        noteText?: string
        highlightText?: string
    } & (
        | { mode: 'create'; pageUrl: string }
        | {
              mode: 'update'
              noteUrl: string
              spaces: Array<{ id: number; name: string }>
          }
    )
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
