import { UILogic, UIEvent } from 'ui-logic-core'

export interface State {}
export type Event = UIEvent<{}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return {}
    }
}
