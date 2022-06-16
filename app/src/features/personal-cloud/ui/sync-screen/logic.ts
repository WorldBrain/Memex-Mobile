import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'
import { AppState, AppStateStatus } from 'react-native'

import { storageKeys } from '../../../../../app.json'
import { MainNavProps, UIServices, UITaskState } from 'src/ui/types'
import { executeUITask } from 'src/ui/utils'

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
            console.log('app state  change:', nextState)
            if (nextState === 'active') {
                await this.startSync()
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
        console.log('stop sync')
    }

    private startSync = async () => {
        console.log('start sync')
    }

    private doSync = async () => {
        await executeUITask<State, 'syncState'>(this, 'syncState', this._doSync)
    }

    private _doSync = async () => {
        const { route, services } = this.props
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
        }
    }

    goToDashboard: EventHandler<'goToDashboard'> = () => {
        this.props.navigation.navigate('Dashboard')
    }
}
