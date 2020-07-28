import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UITaskState, UIServices, NavigationProps } from 'src/ui/types'
import { executeUITask, loadInitial } from 'src/ui/utils'
import { isSyncEnabled, handleSyncError } from 'src/features/sync/utils'

export interface State {
    loadState: UITaskState
    syncState: UITaskState
    syncErrorMessage?: string
    isSynced: boolean
}

export type Event = UIEvent<{
    setSyncStatus: { value: boolean }
    syncNow: null
    clearSyncError: null
}>

export interface Props extends NavigationProps {
    services: UIServices<'localStorage' | 'sync' | 'errorTracker'>
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            isSynced: false,
            syncState: 'pristine',
            loadState: 'pristine',
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            if (await isSyncEnabled(this.props.services)) {
                this.emitMutation({ isSynced: { $set: true } })
            }
        })
    }

    cleanup() {
        this.props.services.sync.continuousSync.events.removeAllListeners(
            'syncFinished',
        )
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

    async syncNow() {
        const { sync } = this.props.services

        sync.continuousSync.events.addListener('syncFinished', ({ error }) => {
            if (error) {
                this.handleSyncError(error)
            } else {
                this.clearSyncError()
            }

            sync.continuousSync.events.removeAllListeners('syncFinished')
        })

        await executeUITask<State, 'syncState', void>(
            this,
            'syncState',
            async () => {
                try {
                    await sync.continuousSync.forceIncrementalSync()
                } catch (err) {
                    this.handleSyncError(err)
                }
            },
        )
    }
}
