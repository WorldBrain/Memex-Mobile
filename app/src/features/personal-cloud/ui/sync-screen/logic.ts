import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'
import { AppStateStatus, AppStateStatic } from 'react-native'

import { storageKeys } from '../../../../../app.json'
import { MainNavProps, UIServices, UITaskState } from 'src/ui/types'
import { SyncStreamInterruptError } from 'src/services/cloud-sync'

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface State {
    syncState: UITaskState
    errorMessage: string | null
    totalDownloads: number | null
    pendingDownloads: number | null
}

export type Event = UIEvent<{
    goToDashboard: null
    retrySync: null
}>

export interface Props extends MainNavProps<'CloudSync'> {
    appState: AppStateStatic
    services: UIServices<
        'errorTracker' | 'localStorage' | 'cloudSync' | 'keepAwake'
    >
}

export default class SyncScreenLogic extends UILogic<State, Event> {
    private removeAppChangeListener!: () => void
    private syncHasFinished = false
    private hasDBBeenWiped = false

    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            syncState: 'pristine',
            errorMessage: null,
            totalDownloads: null,
            pendingDownloads: null,
        }
    }

    async init() {
        const { appState, services } = this.props
        const handleAppStatusChange = async (nextState: AppStateStatus) => {
            if (nextState === 'active' && !this.syncHasFinished) {
                await this.doSync()
            } else if (nextState === 'background') {
                await services.cloudSync.interruptSyncStream()
            }
        }
        appState.addEventListener('change', handleAppStatusChange)

        this.removeAppChangeListener = () =>
            appState.removeEventListener('change', handleAppStatusChange)

        services.cloudSync.events.addListener(
            'syncStatsChanged',
            ({ stats }) => {
                this.emitMutation({
                    pendingDownloads: { $set: stats.pendingDownloads },
                    // This should only set it the first time
                    totalDownloads: {
                        $apply: (prev) => prev ?? stats.totalDownloads,
                    },
                })
            },
        )

        await this.doSync()
    }

    cleanup() {
        this.removeAppChangeListener?.()
        this.props.services.cloudSync.events.removeAllListeners(
            'syncStatsChanged',
        )
    }

    private handleSyncSuccess = async () => {
        const { services, route } = this.props
        this.syncHasFinished = true

        // NOTE: This needs to be set here so the dashboard doesn't redirect here on load after init sync
        await services.localStorage.set(storageKeys.retroSyncFlag, true)
        if (!route.params?.shouldRetrospectiveSync) {
            await services.localStorage.set(storageKeys.initSyncFlag, true)
        }
    }

    private handleSyncError = (err: Error) => {
        this.props.services.errorTracker.track(err)
        this.emitMutation({ errorMessage: { $set: err.message } })
    }

    private doSync = async () => {
        this.emitMutation({ syncState: { $set: 'running' } })

        try {
            await this._doSync()
            await this.handleSyncSuccess()
            this.emitMutation({ syncState: { $set: 'done' } })
        } catch (err) {
            if (err instanceof SyncStreamInterruptError) {
                return
            }
            this.emitMutation({ syncState: { $set: 'error' } })
        }
    }

    private _doSync = async () => {
        const { route, services } = this.props
        services.keepAwake.activate()

        if (route.params?.shouldWipeDBFirst && !this.hasDBBeenWiped) {
            await services.cloudSync.____wipeDBForSync()
            this.hasDBBeenWiped = true
        }

        try {
            if (route.params?.shouldRetrospectiveSync) {
                await services.cloudSync.restrospectiveSync()
            } else {
                await services.cloudSync.syncStream()
            }
        } catch (err) {
            if (!(err instanceof SyncStreamInterruptError)) {
                this.handleSyncError(err)
            }
            throw err
        } finally {
            services.keepAwake.deactivate()
        }
    }

    retrySync: EventHandler<'retrySync'> = async ({ event }) => {
        await this.doSync()
    }

    goToDashboard: EventHandler<'goToDashboard'> = () => {
        this.props.navigation.navigate('Dashboard')
    }
}
