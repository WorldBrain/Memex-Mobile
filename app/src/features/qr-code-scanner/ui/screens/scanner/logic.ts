import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

export interface State {
    isScannerOpen: boolean
    readData?: string
}

export type Event = UIEvent<{
    setDataString: { value?: string }
    setScannerOpen: { value: boolean }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return { readData: undefined, isScannerOpen: false }
    }

    setDataString(
        incoming: IncomingUIEvent<State, Event, 'setDataString'>,
    ): UIMutation<State> {
        return { readData: { $set: incoming.event.value } }
    }

    setScannerOpen(
        incoming: IncomingUIEvent<State, Event, 'setScannerOpen'>,
    ): UIMutation<State> {
        return { isScannerOpen: { $set: incoming.event.value } }
    }
}
