import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

export interface State {}
export type Event = UIEvent<{}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return {}
    }
}
