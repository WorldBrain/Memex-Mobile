import EventEmitter from 'events'
import type StorageManager from '@worldbrain/storex'
import { dangerousPleaseBeSureDeleteAndRecreateDatabase } from 'src/storage/utils'
import { CLOUD_SYNCED_COLLECTIONS } from 'src/features/personal-cloud/storage/constants'
import type { PersonalCloudStorage } from 'src/features/personal-cloud/storage'
import type { PersonalCloudBackend } from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import type { CloudSyncAPI, SyncStats } from './types'
import type { ErrorTrackingService } from '../error-tracking'

export interface Props {
    backend: PersonalCloudBackend
    storage: PersonalCloudStorage
    storageManager: StorageManager
    errorTrackingService: ErrorTrackingService
    setLastUpdateProcessedTime(time: number): Promise<void>
}

export class SyncStreamInterruptError extends Error {
    constructor() {
        super('Sync interrrupt error')
        this.name = this.constructor.name
    }
}

export class CloudSyncService implements CloudSyncAPI {
    events = new EventEmitter() as CloudSyncAPI['events']

    /**
     * Each of these booleans correspond to an invocation of `syncStream` method. To allow each
     * invocation to be interrupted, without affecting other invocations that might overlap their runtimes.
     * */
    private shouldInterruptStream: boolean[] = []
    private streamInvocations: number = 0
    private stats: SyncStats = {
        pendingDownloads: 0,
        pendingUploads: 0,
    }

    constructor(private props: Props) {
        props.backend.events.on('incomingChangesPending', (event) => {
            this._modifyStats({
                pendingDownloads:
                    this.stats.pendingDownloads + event.changeCountDelta,
            })
        })
        props.backend.events.on('incomingChangesProcessed', (event) => {
            this._modifyStats({
                pendingDownloads: this.stats.pendingDownloads - event.count,
            })
        })
    }

    private _modifyStats(updates: Partial<SyncStats>) {
        this.stats = { ...this.stats, ...updates }
        this.events.emit('syncStatsChanged', { stats: this.stats })
    }

    ____wipeDBForSync: CloudSyncAPI['____wipeDBForSync'] = async () => {
        await dangerousPleaseBeSureDeleteAndRecreateDatabase(
            this.props.storageManager,
        )
    }

    sync: CloudSyncAPI['sync'] = async () => {
        const { storage, backend, setLastUpdateProcessedTime } = this.props

        await storage.loadDeviceId()
        await storage.pushAllQueuedUpdates()

        let { batch, lastSeen } = await backend.bulkDownloadUpdates()
        batch = batch.filter((update) =>
            CLOUD_SYNCED_COLLECTIONS.includes(update.collection),
        )
        const { updatesIntegrated } = await storage.integrateUpdates(batch)
        await setLastUpdateProcessedTime(lastSeen)
        return { totalChanges: updatesIntegrated }
    }

    syncStream: CloudSyncAPI['syncStream'] = async () => {
        const {
            storage,
            backend,
            errorTrackingService,
            setLastUpdateProcessedTime,
        } = this.props

        this.streamInvocations += 1
        const currentInvocation = this.streamInvocations

        await storage.loadDeviceId()
        await storage.pushAllQueuedUpdates()

        try {
            for await (const { batch, lastSeen } of backend.streamUpdates({
                skipUserChangeListening: true,
            })) {
                try {
                    if (this.shouldInterruptStream[currentInvocation]) {
                        throw new SyncStreamInterruptError()
                    }

                    await storage.integrateUpdates(batch)
                    await setLastUpdateProcessedTime(lastSeen)

                    if (this.shouldInterruptStream[currentInvocation]) {
                        throw new SyncStreamInterruptError()
                    }
                } catch (err) {
                    if (err instanceof SyncStreamInterruptError) {
                        throw err
                    }
                    errorTrackingService.track(err)
                }
            }
        } catch (err) {
            if (err instanceof SyncStreamInterruptError) {
                throw err
            }
            errorTrackingService.track(err)
            throw err
        }
    }

    endSyncStream: CloudSyncAPI['endSyncStream'] = async () => {
        this.stats = { pendingDownloads: 0, pendingUploads: 0 }
        this.shouldInterruptStream[this.streamInvocations] = true
    }
}
