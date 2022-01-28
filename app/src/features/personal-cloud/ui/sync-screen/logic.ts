import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'

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
        await this.doSync()
    }

    private handleSyncSuccess = async () => {
        await this.props.services.localStorage.set(storageKeys.syncKey, true)
    }

    private handleSyncError = (err: Error) => {
        this.props.services.errorTracker.track(err)
        this.emitMutation({ errorMessage: { $set: err.message } })
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
            await services.cloudSync.sync()
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
