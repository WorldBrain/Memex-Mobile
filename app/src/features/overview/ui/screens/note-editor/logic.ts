import { Alert } from 'react-native'

import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { MainNavProps, UIStorageModules, UITaskState } from 'src/ui/types'
import { executeUITask } from 'src/ui/utils'
import { NoteEditMode } from './types'
import { Anchor } from 'src/content-script/types'

export interface State {
    noteText: string
    highlightText: string | null
    highlightTextLines?: number
    showAllText: boolean
    saveState: UITaskState
}

export type Event = UIEvent<{
    goBack: null
    saveNote: null
    changeNoteText: { value: string }
    setHighlightTextLines: { lines: number }
    setShowAllText: { show: boolean }
}>

export interface Props extends MainNavProps<'NoteEditor'> {
    storage: UIStorageModules<'metaPicker' | 'pageEditor'>
}

export default class Logic extends UILogic<State, Event> {
    static HIGHLIGHT_MAX_LINES = 4

    readerScrollPercent?: number
    highlightAnchor?: Anchor
    pageUrl: string
    pageTitle?: string
    noteUrl?: string
    mode: NoteEditMode
    initNoteText: string
    selectedList?: string

    constructor(private props: Props) {
        super()

        const { params } = props.route

        this.mode = params.mode
        this.highlightAnchor = params.anchor
        this.pageUrl = params.pageUrl
        this.pageTitle = params.pageTitle
        this.noteUrl = params.noteUrl
        this.initNoteText = params.noteText ?? ''
        this.selectedList = params.selectedList
        this.readerScrollPercent = params.readerScrollPercent
    }

    getInitialState(): State {
        const { params } = this.props.route

        return {
            noteText: params.noteText ?? '',
            highlightText: params.highlightText ?? null,
            showAllText: false,
            saveState: 'pristine',
        }
    }

    private navigateBack = () => this.props.navigation.goBack()

    goBack({ previousState }: IncomingUIEvent<State, Event, 'goBack'>) {
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

    private handleCreation(state: State) {
        const { pageEditor } = this.props.storage.modules

        if (this.highlightAnchor != null) {
            return pageEditor.createAnnotation({
                body: this.highlightAnchor.quote,
                selector: this.highlightAnchor,
                pageUrl: this.pageUrl,
                comment: state.noteText,
                pageTitle: this.pageTitle ?? '',
            })
        }

        return pageEditor.createNote({
            pageUrl: this.pageUrl,
            comment: state.noteText,
            pageTitle: this.pageTitle ?? '',
        })
    }

    async saveNote({
        previousState: state,
    }: IncomingUIEvent<State, Event, 'saveNote'>) {
        const { pageEditor } = this.props.storage.modules

        await executeUITask<State, 'saveState', void>(
            this,
            'saveState',
            async () => {
                if (this.mode === 'create') {
                    return this.handleCreation(state)
                }

                return pageEditor.updateNoteText({
                    url: this.noteUrl!,
                    text: state.noteText,
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
}
