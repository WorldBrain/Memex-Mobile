import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { NavigationProps, UIStorageModules } from 'src/ui/types'

export interface State {
    noteText: string
    highlightText: string | null
    highlightTextLines?: number
    showAllText: boolean
}

export type Event = UIEvent<{
    changeNoteText: { value: string }
    saveNote: {}
    setHighlightTextLines: { lines: number }
    setShowAllText: { show: boolean }
}>

export interface Props extends NavigationProps {
    storage: UIStorageModules<'metaPicker' | 'pageEditor'>
}

export default class Logic extends UILogic<State, Event> {
    static HIGHLIGHT_MAX_LINES = 4

    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        const noteText = this.props.navigation.getParam('noteText', '')
        const highlightText = this.props.navigation.getParam(
            'highlightText',
            null,
        )

        return {
            noteText,
            highlightText,
            showAllText: false,
        }
    }

    changeInputText(
        incoming: IncomingUIEvent<State, Event, 'changeNoteText'>,
    ): UIMutation<State> {
        return {
            noteText: { $set: incoming.event.value },
        }
    }

    async saveNote(incoming: IncomingUIEvent<State, Event, 'saveNote'>) {
        const { pageEditor } = this.props.storage.modules

        console.log('TODO: save note:', incoming.previousState.noteText)
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
