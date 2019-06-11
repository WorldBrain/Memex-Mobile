import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from "ui-logic-core"

export interface State {
    sharedText : string
}
export type Event = UIEvent<{
    setSharedText : { text : string }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState() {
        return {
            sharedText: null
        }
    }

    setSharedText(incoming : IncomingUIEvent<State, Event, 'setSharedText'>) : UIMutation<State> {
        return { sharedText: { $set: incoming.event.text } }
    }
}
