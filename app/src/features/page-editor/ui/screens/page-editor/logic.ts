import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { Page } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import testData from './test-data'

export interface State {
    page: Page
    mode: EditorMode
}

export type Event = UIEvent<{
    setEditorMode: { mode: EditorMode }
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
}
