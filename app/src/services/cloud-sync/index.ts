import EventEmitter from 'events'
import type StorageManager from '@worldbrain/storex'
import { AsyncMutex } from '@worldbrain/memex-common/lib/utils/async-mutex'
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
    private syncStreamMutex = new AsyncMutex()
    private shouldInterruptStream = false
    private stats: SyncStats = {
        totalDownloads: null,
        pendingDownloads: null,
    }

    constructor(private props: Props) {
        props.backend.events.on('incomingChangesPending', (event) => {
            this._modifyStats({
                totalDownloads: event.changeCountDelta,
                pendingDownloads:
                    this.stats.pendingDownloads != null &&
                    this.stats.pendingDownloads < 0
                        ? event.changeCountDelta + this.stats.pendingDownloads // this case is when 'incomingChangesProcessed' fires first
                        : event.changeCountDelta,
            })
        })
        props.backend.events.on('incomingChangesProcessed', (event) => {
            this._modifyStats({
                pendingDownloads:
                    (this.stats.pendingDownloads ?? 0) - event.count,
            })
        })
    }

    private _modifyStats(updates: Partial<SyncStats>) {
        this.stats = { ...this.stats, ...updates }
        this.events.emit('syncStatsChanged', { stats: this.stats })
    }

    ____wipeDBForSync: CloudSyncAPI['____wipeDBForSync'] = async () => {
        await this.props.setLastUpdateProcessedTime(0)
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

        const { releaseMutex } = await this.syncStreamMutex.lock()

        await storage.loadDeviceId()
        await storage.pushAllQueuedUpdates()

        try {
            const maybeInterruptStream = () => {
                if (this.shouldInterruptStream) {
                    this.shouldInterruptStream = false
                    throw new SyncStreamInterruptError()
                }
            }

            for await (const { batch, lastSeen } of backend.streamUpdates({
                skipUserChangeListening: true,
            })) {
                try {
                    maybeInterruptStream()
                    await storage.integrateUpdates(batch)
                    await setLastUpdateProcessedTime(lastSeen)
                    maybeInterruptStream()
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
        } finally {
            releaseMutex()
        }
    }

    interruptSyncStream: CloudSyncAPI['interruptSyncStream'] = async () => {
        this.shouldInterruptStream = true
    }
}
