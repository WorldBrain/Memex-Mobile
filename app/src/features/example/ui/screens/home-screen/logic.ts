import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

export interface State {
    modified: boolean
    text: string
}
export type Event = UIEvent<{
    setText: { text: string }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState() {
        return {
            modified: false,
            text: 'Click me!',
        }
    }

    setText(
        incoming: IncomingUIEvent<State, Event, 'setText'>,
    ): UIMutation<State> {
        return { modified: { $set: true }, text: { $set: incoming.event.text } }
    }
}
