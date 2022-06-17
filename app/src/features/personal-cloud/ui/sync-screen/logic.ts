import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'
import { AppState, AppStateStatus } from 'react-native'

import { storageKeys } from '../../../../../app.json'
import { MainNavProps, UIServices, UITaskState } from 'src/ui/types'

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface State {
    syncState: UITaskState
    errorMessage: string | null
}

export type Event = UIEvent<{
    goToDashboard: null
}>

export interface Props extends MainNavProps<'CloudSync'> {
    services: UIServices<
        'errorTracker' | 'localStorage' | 'cloudSync' | 'keepAwake'
    >
}

export default class SyncScreenLogic extends UILogic<State, Event> {
    private removeAppChangeListener!: () => void
    /**
     * This exists due to the way multiple sync streams can be invoked if you switch away then back to the app fast enough.
     * We need a way to know that no sync streams invocations are running anymore to finally mark the loading state off as "done",
     * as opposed to one invocation finishing while others still exist.
     */
    private runningSyncInvocations: number = 0

    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            syncState: 'pristine',
            errorMessage: null,
        }
    }

    async init() {
        const handleAppStatusChange = async (nextState: AppStateStatus) => {
            if (nextState === 'active') {
                await this.doSync()
            } else {
                await this.stopSync()
            }
        }
        AppState.addEventListener('change', handleAppStatusChange)

        this.removeAppChangeListener = () =>
            AppState.removeEventListener('change', handleAppStatusChange)

        await this.doSync()
    }

    cleanup() {
        this.removeAppChangeListener?.()
    }

    private handleSyncSuccess = async () => {
        await this.props.services.localStorage.set(storageKeys.syncKey, true)
    }

    private handleSyncError = (err: Error) => {
        this.props.services.errorTracker.track(err)
        this.emitMutation({ errorMessage: { $set: err.message } })
    }

    private stopSync = async () => {
        await this.props.services.cloudSync.endSyncStream()
    }

    private doSync = async () => {
        this.emitMutation({ syncState: { $set: 'running' } })

        try {
            await this._doSync()
            if (this.runningSyncInvocations === 0) {
                this.emitMutation({ syncState: { $set: 'done' } })
            }
        } catch (err) {
            this.emitMutation({ syncState: { $set: 'error' } })
        }
    }

    private _doSync = async () => {
        const { route, services } = this.props
        this.runningSyncInvocations += 1
        services.keepAwake.activate()

        if (route.params?.shouldWipeDBFirst) {
            await services.cloudSync.____wipeDBForSync()
        }

        try {
            await services.cloudSync.syncStream()
            await this.handleSyncSuccess()
        } catch (err) {
            this.handleSyncError(err)
            throw err
        } finally {
            services.keepAwake.deactivate()
            this.runningSyncInvocations -= 1
        }
    }

    goToDashboard: EventHandler<'goToDashboard'> = () => {
        this.props.navigation.navigate('Dashboard')
    }
}
