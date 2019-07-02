import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from "ui-logic-core"

import initTestData from './test-data'
import { Page } from "src/features/overview/types";

export interface State {
    pages : Page[]
}
export type Event = UIEvent<{
    setPages : { pages : Page[] }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return initTestData()
    }

    setText(incoming : IncomingUIEvent<State, Event, 'setPages'>) : UIMutation<State> {
        return { pages: { $set: incoming.event.pages } }
    }
}
