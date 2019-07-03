import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import initTestData from './test-data'
import { NotesSection } from './types'

export interface State {
    sections: NotesSection[]
}

export type Event = UIEvent<{
    setSections: { sections: NotesSection[] }
    toggleNotes: {}
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return initTestData()
    }

    setText(
        incoming: IncomingUIEvent<State, Event, 'setSections'>,
    ): UIMutation<State> {
        return { sections: { $set: incoming.event.sections } }
    }
}
