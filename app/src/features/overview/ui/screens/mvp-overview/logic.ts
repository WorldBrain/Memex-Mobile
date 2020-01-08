import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UITaskState } from 'src/ui/types'
import { executeUITask } from 'src/ui/utils'
import { Props } from '.'

export interface State {
    isSynced: boolean
    syncState: UITaskState
}

export type Event = UIEvent<{
    setSyncStatus: { value: boolean }
    syncNow: {}
}>

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return { isSynced: false, syncState: 'pristine' }
    }

    setSyncStatus(
        incoming: IncomingUIEvent<State, Event, 'setSyncStatus'>,
    ): UIMutation<State> {
        return { isSynced: { $set: incoming.event.value } }
    }

    async syncNow(incoming: IncomingUIEvent<State, Event, 'syncNow'>) {
        return executeUITask(this, 'syncState', async () =>
            this.props.services.sync.continuousSync.forceIncrementalSync(),
        )
    }
}
