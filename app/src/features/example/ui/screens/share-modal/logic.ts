import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

export interface State {
    isShown: boolean
}
export type Event = UIEvent<{
    setIsShown: { isShown: boolean }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState() {
        return {
            isShown: true,
        }
    }

    setSharedText(
        incoming: IncomingUIEvent<State, Event, 'setIsShown'>,
    ): UIMutation<State> {
        return { isShown: { $set: incoming.event.isShown } }
    }
}
