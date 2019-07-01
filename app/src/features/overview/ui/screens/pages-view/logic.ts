import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from "ui-logic-core"

import { Props as PageProps } from '../../components/result-page'
import initTestData from './test-data'

export interface State {
    pages : PageProps[]
}
export type Event = UIEvent<{
    setPages : { pages : PageProps[] }
    deletePages : { pages : PageProps[] }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return initTestData()
    }

    setText(incoming : IncomingUIEvent<State, Event, 'setPages'>) : UIMutation<State> {
        return { pages: { $set: incoming.event.pages } }
    }
}
