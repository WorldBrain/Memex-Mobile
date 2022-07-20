import type { EditorMode } from 'src/features/page-editor/types'
import type { Anchor } from 'src/content-script/types'
import type { UIPageWithNotes } from 'src/features/overview/types'
import type { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'

export type MainNavigatorRoutes = keyof MainNavigatorParamList
export type MainNavigatorParamList = {
    DebugConsole: undefined
    SettingsMenu: undefined
    Pairing: undefined
    CloudSync:
        | {
              shouldWipeDBFirst?: boolean
              shouldRetrospectiveSync?: boolean
          }
        | undefined
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
        privacyLevel?: AnnotationPrivacyLevels
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
