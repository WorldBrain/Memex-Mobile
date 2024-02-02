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
    Dashboard:
        | {
              selectedListId?: number
              openFeed?: boolean
              skipDeepLinkCheck?: boolean
          }
        | undefined
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
        videoTimestamp?: [string, string]
    } & (
        | { mode: 'create'; pageUrl: string }
        | {
              mode: 'update'
              noteUrl: string
              spaces: Array<{ id: number; name: string; remoteId?: string }>
          }
    )
    Reader: {
        url: string
        /** Affords sending page changes that occur in this route back up to parent route. */
        updatePage: (page: UIPageWithNotes) => void
    }
    ShareModal: undefined
}

// export type ShareNavigatorRoutes = keyof MainNavigatorParamList
// export type ShareNavigatorParamList = {
//     ShareModal: undefined
//     Login: undefined
//     Reader: {
//         pageUrl: string
//     }
// }
