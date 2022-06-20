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
}>

export interface Props extends MainNavProps<'CloudSync'> {
    appState: AppStateStatic
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
            } else {
                await this.stopSync()
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
                        $apply: (prev) => prev ?? stats.pendingDownloads,
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
        this.syncHasFinished = true
        await this.props.services.localStorage.set(storageKeys.syncKey, true)
    }

    private handleSyncError = (err: Error) => {
        this.props.services.errorTracker.track(err)
        this.emitMutation({ errorMessage: { $set: err.message } })
    }

    private stopSync = async () => {
        this.emitMutation({
            totalDownloads: { $set: null },
            pendingDownloads: { $set: null },
        })
        await this.props.services.cloudSync.endSyncStream()
    }

    private doSync = async () => {
        this.emitMutation({ syncState: { $set: 'running' } })

        try {
            await this._doSync()
            if (this.runningSyncInvocations === 0) {
                await this.handleSyncSuccess()
                this.emitMutation({ syncState: { $set: 'done' } })
            }
        } catch (err) {
            if (err instanceof SyncStreamInterruptError) {
                return
            }
            this.emitMutation({ syncState: { $set: 'error' } })
        }
    }

    private _doSync = async () => {
        const { route, services } = this.props
        this.runningSyncInvocations += 1
        services.keepAwake.activate()

        if (route.params?.shouldWipeDBFirst && !this.hasDBBeenWiped) {
            this.hasDBBeenWiped = true
            await services.cloudSync.____wipeDBForSync()
        }

        try {
            await services.cloudSync.syncStream()
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
