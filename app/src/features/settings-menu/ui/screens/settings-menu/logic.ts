import {
    UILogic,
    UIEvent,
    UIEventHandler,
    IncomingUIEvent,
    UIMutation,
} from 'ui-logic-core'

import { UITaskState, UIServices, MainNavProps } from 'src/ui/types'
import { executeUITask, loadInitial } from 'src/ui/utils'
import { isSyncEnabled, handleSyncError } from 'src/features/sync/utils'

export interface State {
    loadState: UITaskState
    syncState: UITaskState
    syncErrorMessage?: string
    isLoggedIn: boolean
    isSynced: boolean
}

export type Event = UIEvent<{
    setSyncStatus: { value: boolean }
    logout: null
    syncNow: null
    clearSyncError: null
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends MainNavProps<'SettingsMenu'> {
    services: UIServices<
        'localStorage' | 'syncStorage' | 'cloudSync' | 'auth' | 'errorTracker'
    >
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            isSynced: false,
            isLoggedIn: false,
            syncState: 'pristine',
            loadState: 'pristine',
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            if (await isSyncEnabled(this.props.services)) {
                this.emitMutation({ isSynced: { $set: true } })
            }

            const user = await this.props.services.auth.getCurrentUser()
            if (user != null) {
                this.emitMutation({ isLoggedIn: { $set: true } })
            }
        })
    }

    clearSyncError() {
        this.emitMutation({ syncErrorMessage: { $set: undefined } })
    }

    setSyncStatus(
        incoming: IncomingUIEvent<State, Event, 'setSyncStatus'>,
    ): UIMutation<State> {
        return { isSynced: { $set: incoming.event.value } }
    }

    private handleSyncError = (error: Error) => {
        if (!handleSyncError(error, this.props).errorHandled) {
            this.emitMutation({ syncErrorMessage: { $set: error.message } })
        }
    }

    logout: EventHandler<'logout'> = ({}) => {
        this.props.services.auth.signOut()

        this.emitMutation({ isLoggedIn: { $set: false } })
    }

    async syncNow() {
        const { cloudSync } = this.props.services

        await executeUITask<State, 'syncState'>(this, 'syncState', async () => {
            try {
                await cloudSync.runContinuousSync()
                this.clearSyncError()
            } catch (err) {
                this.handleSyncError(err)
            }
        })
    }
}
