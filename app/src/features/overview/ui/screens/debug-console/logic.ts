import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

export type LogType = 'out' | 'warn' | 'error'
export interface State {
    logType: LogType
    refreshedAt: Date
}

export type Event = UIEvent<{ setLogType: { type: LogType }; refreshState: {} }>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return { logType: 'out', refreshedAt: new Date() }
    }

    setLogType(
        incoming: IncomingUIEvent<State, Event, 'setLogType'>,
    ): UIMutation<State> {
        return { logType: { $set: incoming.event.type } }
    }

    refreshState(
        incoming: IncomingUIEvent<State, Event, 'refreshState'>,
    ): UIMutation<State> {
        return { refreshedAt: { $set: new Date() } }
    }
}
