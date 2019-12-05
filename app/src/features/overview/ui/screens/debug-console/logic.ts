import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

export type LogType = 'out' | 'warn' | 'error'
export interface State {
    logType: LogType
}

export type Event = UIEvent<{ setLogType: { type: LogType } }>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return { logType: 'out' }
    }

    setLogType(
        incoming: IncomingUIEvent<State, Event, 'setLogType'>,
    ): UIMutation<State> {
        return { logType: { $set: incoming.event.type } }
    }
}
