import type { UIEvent } from 'ui-logic-core'
import type { UITaskState } from 'src/ui/types'
import type { SpacePickerEntry } from 'src/features/meta-picker/types'
import type { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import { DeviceDetails } from './util'

export interface State {
    loadState: UITaskState
    spacesState: UITaskState
    bookmarkState: UITaskState
    syncRetryState: UITaskState

    pageUrl: string
    pageTitle: string
    statusText: string
    noteText: string
    spacesToAdd: number[]
    isStarred: boolean
    isModalShown: boolean
    errorMessage?: string
    showSavingPage: boolean
    isSpacePickerShown: boolean
    isUnsupportedApplication: boolean
    privacyLevel: AnnotationPrivacyLevels
    keyboardHeight: number
    pageSaveFinished: boolean
    deviceInfo?: DeviceDetails | null
    modalState: 'reader' | 'spacePicker'
}

export type Event = UIEvent<{
    save: { thenGoToApp?: boolean }
    retrySync: null

    undoPageSave: null
    metaPickerEntryPress: { entry: SpacePickerEntry }
    setSpacePickerShown: { isShown: boolean }
    setModalVisible: { shown: boolean }
    togglePageStar: null
    setNoteText: { value: string }

    toggleSpace: { id: number }
    setPageUrl: { url: string }
    setPageStar: { value: boolean }
    setStatusText: { value: string }
    setSpacesToAdd: { values: number[] }
    setModalState: { state: 'reader' | 'spacePicker' }
    setPrivacyLevel: { value: AnnotationPrivacyLevels }
    clearSyncError: null
}>
