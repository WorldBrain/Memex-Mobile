import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { SyncStatus } from 'src/features/sync/types'

export interface State {
    status: SyncStatus
}
export type Event = UIEvent<{
    setSyncStatus: { value: SyncStatus }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return {
            status: 'setup',
        }
    }

    setSyncStatus(
        incoming: IncomingUIEvent<State, Event, 'setSyncStatus'>,
    ): UIMutation<State> {
        return { status: { $set: incoming.event.value } }
    }
}
