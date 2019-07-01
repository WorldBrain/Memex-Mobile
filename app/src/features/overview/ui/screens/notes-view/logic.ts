import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from "ui-logic-core"

import { Props as PageProps } from '../../components/result-page-with-notes'
import initTestData from './test-data'

interface NotesSection {
    title: string
    data: PageProps[]
}

export interface State {
    sections : NotesSection[]
}

export type Event = UIEvent<{
    setSections: { sections : NotesSection[] }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return initTestData()
    }

    setText(incoming : IncomingUIEvent<State, Event, 'setSections'>) : UIMutation<State> {
        return { sections: { $set: incoming.event.sections } }
    }
}
