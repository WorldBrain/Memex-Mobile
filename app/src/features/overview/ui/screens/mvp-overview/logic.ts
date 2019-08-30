import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { ResultType } from '../../../types'

export interface State {
    isSynced: boolean
}

export type Event = UIEvent<{ setSyncStatus: { value: boolean } }>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return { isSynced: false }
    }

    setSyncStatus(
        incoming: IncomingUIEvent<State, Event, 'setSyncStatus'>,
    ): UIMutation<State> {
        return { isSynced: { $set: incoming.event.value } }
    }
}
