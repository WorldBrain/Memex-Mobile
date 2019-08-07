import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UIPageWithNotes as Page } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import testData from './test-data'

export interface State {
    showNoteAdder: boolean
    noteAdderInput: string
    page: Page
    mode: EditorMode
}

export type Event = UIEvent<{
    setShowNoteAdder: { show: boolean }
    setEditorMode: { mode: EditorMode }
    setInputText: { text: string }
    saveNote: { text: string }
    setPage: { page: Page }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return testData()
    }

    setEditorMode(
        incoming: IncomingUIEvent<State, Event, 'setEditorMode'>,
    ): UIMutation<State> {
        return { mode: { $set: incoming.event.mode } }
    }

    setPage(
        incoming: IncomingUIEvent<State, Event, 'setPage'>,
    ): UIMutation<State> {
        return { page: { $set: incoming.event.page } }
    }

    setShowNoteAdder(
        incoming: IncomingUIEvent<State, Event, 'setShowNoteAdder'>,
    ): UIMutation<State> {
        return { showNoteAdder: { $set: incoming.event.show } }
    }

    setInputText(
        incoming: IncomingUIEvent<State, Event, 'setInputText'>,
    ): UIMutation<State> {
        return { noteAdderInput: { $set: incoming.event.text } }
    }

    saveNote(
        incoming: IncomingUIEvent<State, Event, 'saveNote'>,
    ): UIMutation<State> {
        // TODO: Generate new URL, or get it from storage layer
        return {
            page: ({ notes = [], ...page }) => ({
                ...page,
                notes: [
                    ...notes,
                    {
                        url: page.url,
                        date: 'now',
                        commentText: incoming.event.text,
                    },
                ],
            }),
        }
    }
}
