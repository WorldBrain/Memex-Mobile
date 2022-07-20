import { Alert } from 'react-native'

import {
    UILogic,
    UIEvent,
    IncomingUIEvent,
    UIMutation,
    UIEventHandler,
} from 'ui-logic-core'
import { executeUITask } from 'src/ui/utils'
import type {
    MainNavProps,
    UIStorageModules,
    UITaskState,
    UIServices,
} from 'src/ui/types'
import type { NoteEditMode } from './types'
import type { Anchor } from 'src/content-script/types'
import type { SpacePickerEntry } from 'src/features/meta-picker/types'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'

export interface State {
    noteText: string
    isSpacePickerShown: boolean
    highlightText: string | null
    highlightTextLines?: number
    showAllText: boolean
    saveState: UITaskState
    privacyLevel: AnnotationPrivacyLevels
    spacesToAdd: Array<{ id: number; name: string; remoteId?: string }>
}

export type Event = UIEvent<{
    goBack: null
    saveNote: null
    changeNoteText: { value: string }
    setShowAllText: { show: boolean }
    setPrivacyLevel: { value: AnnotationPrivacyLevels }
    setHighlightTextLines: { lines: number }
    setSpacePickerShown: { isShown: boolean }
    selectSpacePickerEntry: { entry: SpacePickerEntry }
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends MainNavProps<'NoteEditor'> {
    storage: UIStorageModules<'pageEditor' | 'contentSharing' | 'metaPicker'>
    services: UIServices<'annotationSharing'>
}

export default class Logic extends UILogic<State, Event> {
    static HIGHLIGHT_MAX_LINES = 4

    highlightAnchor?: Anchor
    pageUrl: string | null
    noteUrl: string | null
    pageTitle?: string
    mode: NoteEditMode
    initNoteText: string
    initPrivacyLevel: AnnotationPrivacyLevels
    initSpaces: Array<{ id: number; name: string; remoteId?: string }>

    constructor(private props: Props) {
        super()

        const { params } = props.route

        this.mode = params.mode
        this.pageTitle = params.pageTitle
        this.highlightAnchor = params.anchor
        this.initNoteText = params.noteText ?? ''
        this.initSpaces = params.mode === 'update' ? params.spaces ?? [] : []
        this.initPrivacyLevel =
            params.privacyLevel ?? AnnotationPrivacyLevels.PRIVATE
        this.noteUrl = params.mode === 'update' ? params.noteUrl : null
        this.pageUrl = params.mode === 'create' ? params.pageUrl : null
    }

    getInitialState(): State {
        const { params } = this.props.route

        return {
            highlightText: params.highlightText ?? null,
            privacyLevel: this.initPrivacyLevel,
            spacesToAdd: this.initSpaces,
            noteText: this.initNoteText,
            isSpacePickerShown: false,
            saveState: 'pristine',
            showAllText: false,
        }
    }

    private navigateBack = () => this.props.navigation.goBack()

    goBack({ previousState }: IncomingUIEvent<State, Event, 'goBack'>) {
        if (previousState.isSpacePickerShown) {
            this.emitMutation({ isSpacePickerShown: { $set: false } })
            return
        }

        if (previousState.noteText?.trim() !== this.initNoteText.trim()) {
            Alert.alert('Discard Changes?', `You've made unsaved changes`, [
                {
                    text: 'Discard',
                    onPress: this.navigateBack,
                },
                { text: 'Continue' },
            ])
        } else {
            this.navigateBack()
        }
    }

    changeNoteText(
        incoming: IncomingUIEvent<State, Event, 'changeNoteText'>,
    ): UIMutation<State> {
        return {
            noteText: { $set: incoming.event.value },
        }
    }

    private async handleCreation(state: State) {
        const { pageEditor, contentSharing } = this.props.storage.modules
        const { annotationSharing } = this.props.services

        let annotationUrl: string
        if (this.highlightAnchor != null) {
            const result = await pageEditor.createAnnotation({
                body: this.highlightAnchor.quote,
                selector: this.highlightAnchor,
                pageUrl: this.pageUrl!,
                comment: state.noteText,
                pageTitle: this.pageTitle ?? '',
            })
            annotationUrl = result.annotationUrl
        } else {
            const result = await pageEditor.createNote({
                pageUrl: this.pageUrl!,
                comment: state.noteText,
                pageTitle: this.pageTitle ?? '',
            })
            annotationUrl = result.annotationUrl
        }

        if (state.privacyLevel !== this.getInitialState().privacyLevel) {
            await contentSharing.setAnnotationPrivacyLevel({
                annotation: annotationUrl,
                privacyLevel: state.privacyLevel,
            })
        }

        await annotationSharing.addAnnotationToLists({
            annotationUrl,
            listIds: state.spacesToAdd.map((space) => space.id),
        })
    }

    saveNote: EventHandler<'saveNote'> = async ({ previousState }) => {
        const { pageEditor, contentSharing } = this.props.storage.modules

        await executeUITask<State, 'saveState', void>(
            this,
            'saveState',
            async () => {
                if (this.mode === 'create') {
                    await this.handleCreation(previousState)
                    return
                }

                if (
                    previousState.privacyLevel !==
                    this.getInitialState().privacyLevel
                ) {
                    const extracted = contentSharing.setAnnotationPrivacyLevel({
                        annotation: this.noteUrl!,
                        privacyLevel: previousState.privacyLevel,
                    })
                    await extracted
                }

                await pageEditor.updateNoteText({
                    url: this.noteUrl!,
                    text: previousState.noteText,
                })
            },
        )

        this.navigateBack()
    }

    setHighlightTextLines(
        incoming: IncomingUIEvent<State, Event, 'setHighlightTextLines'>,
    ): UIMutation<State> {
        return {
            highlightTextLines: { $set: incoming.event.lines },
        }
    }

    setShowAllText(
        incoming: IncomingUIEvent<State, Event, 'setShowAllText'>,
    ): UIMutation<State> {
        return {
            showAllText: {
                $set: incoming.event.show,
            },
        }
    }

    setPrivacyLevel: EventHandler<'setPrivacyLevel'> = async ({ event }) => {
        this.emitMutation({ privacyLevel: { $set: event.value } })
    }

    setSpacePickerShown: EventHandler<'setSpacePickerShown'> = ({ event }) => {
        this.emitMutation({ isSpacePickerShown: { $set: event.isShown } })
    }

    selectSpacePickerEntry: EventHandler<'selectSpacePickerEntry'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            spacesToAdd: event.entry.isChecked
                ? (spaces) =>
                      spaces.filter((space) => space.id !== event.entry.id)
                : { $push: [{ id: event.entry.id, name: event.entry.name }] },
        })

        // No need to perform writes yet if we're in create mode
        if (this.mode === 'create') {
            return
        }

        const { annotationSharing } = this.props.services
        if (event.entry.isChecked) {
            await annotationSharing.removeAnnotationFromList({
                listId: event.entry.id,
                annotationUrl: this.noteUrl!,
            })
        } else {
            await annotationSharing.addAnnotationToLists({
                listIds: [event.entry.id],
                annotationUrl: this.noteUrl!,
            })
        }
    }
}
