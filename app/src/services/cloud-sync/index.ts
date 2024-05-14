import EventEmitter from 'events'
import type StorageManager from '@worldbrain/storex'
import { AsyncMutex } from '@worldbrain/memex-common/lib/utils/async-mutex'
import { dangerousPleaseBeSureDeleteAndRecreateDatabase } from 'src/storage/utils'
import type { PersonalCloudStorage } from 'src/features/personal-cloud/storage'
import type { PersonalCloudBackend } from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import type { CloudSyncAPI, SyncStats } from './types'
import type { ErrorTrackingService } from '../error-tracking'
import type { UserReference } from '@worldbrain/memex-common/lib/web-interface/types/users'
import {
    CITATIONS_FEATURE_BUG_FIX_RELEASE,
    CITATIONS_FEATURE_RELEASE,
} from './constants'

export interface Props {
    backend: PersonalCloudBackend
    storage: PersonalCloudStorage
    storageManager: StorageManager
    errorTrackingService: ErrorTrackingService
    setSyncLastProcessedTime(time: number): Promise<void>
    setRetroSyncLastProcessedTime(time: number): Promise<void>
    getRetroSyncLastProcessedTime(): Promise<number | null>
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
        totalDownloads: 0,
        downloadProgress: 0,
    }

    constructor(private props: Props) {
        props.backend.events.on('incomingChangesProcessed', (event) => {
            this._modifyStats({
                downloadProgress:
                    (this.stats.downloadProgress ?? 0) + event.count,
            })
        })
    }

    private _modifyStats(updates: Partial<SyncStats>) {
        this.stats = { ...this.stats, ...updates }
        this.events.emit('syncStatsChanged', { stats: this.stats })
    }

    ____wipeDBForSync: CloudSyncAPI['____wipeDBForSync'] = async () => {
        this.resetSyncStats()
        await this.props.setSyncLastProcessedTime(0)
        await dangerousPleaseBeSureDeleteAndRecreateDatabase(
            this.props.storageManager,
        )
    }

    private resetSyncStats() {
        this.stats = {
            totalDownloads: 0,
            downloadProgress: 0,
        }
    }

    sync: CloudSyncAPI['sync'] = async () => {
        const { storage, backend, setSyncLastProcessedTime } = this.props

        await storage.loadDeviceId()
        await storage.pushAllQueuedUpdates()

        const { batch, lastSeen } = await backend.bulkDownloadUpdates()
        const { updatesIntegrated } = await storage.integrateUpdates(batch)
        await setSyncLastProcessedTime(lastSeen)
        return { totalChanges: updatesIntegrated }
    }

    private maybeInterruptSyncStream() {
        if (this.shouldInterruptStream) {
            this.shouldInterruptStream = false
            throw new SyncStreamInterruptError()
        }
    }

    private handleSyncStreamError(err: Error) {
        if (err instanceof SyncStreamInterruptError) {
            throw err
        }
        this.props.errorTrackingService.track(err)
        throw err
    }

    syncStream: CloudSyncAPI['syncStream'] = async () => {
        const { storage, backend, setSyncLastProcessedTime } = this.props
        const { releaseMutex } = await this.syncStreamMutex.lock()
        await storage.loadDeviceId()
        await storage.pushAllQueuedUpdates()

        const userId = await storage.loadUserId()
        let totalDownloads = 0
        totalDownloads = await this.props.backend.countPendingUpdates({})
        this.stats.totalDownloads = totalDownloads

        if (totalDownloads === 0) {
            releaseMutex()
            return
        }

        this._modifyStats({
            totalDownloads: totalDownloads,
            downloadProgress: 0,
        })

        let downloadProgress = 0

        if (!userId) {
            throw new Error('Cannot start sync strema as user not logged in')
        }

        try {
            for await (const { batch, lastSeen } of backend.streamUpdates({
                mode: 'single-invocation',
            })) {
                this.maybeInterruptSyncStream()
                await storage.integrateUpdates(batch)
                await setSyncLastProcessedTime(lastSeen)
                this.maybeInterruptSyncStream()
            }
        } catch (err) {
            this.handleSyncStreamError(err)
        } finally {
            releaseMutex()
        }
    }

    retrospectiveSync: CloudSyncAPI['retrospectiveSync'] = async () => {
        const {
            storage,
            backend,
            getRetroSyncLastProcessedTime,
            setRetroSyncLastProcessedTime,
        } = this.props
        const { releaseMutex } = await this.syncStreamMutex.lock()
        await storage.loadDeviceId()
        await storage.pushAllQueuedUpdates()

        // NOTE these founds are specific to dates when a bug was released and then fixed. They should be changed
        //  before using this for other scenarios
        const lowerBound = Math.max(
            (await getRetroSyncLastProcessedTime()) ?? 0,
            CITATIONS_FEATURE_RELEASE,
        )
        const upperBound = CITATIONS_FEATURE_BUG_FIX_RELEASE

        try {
            for await (const { batch, lastSeen } of backend.streamUpdates({
                mode: 'single-invocation',
                startTime: lowerBound,
            })) {
                if (lastSeen > upperBound) {
                    break
                }
                this.maybeInterruptSyncStream()
                await storage.integrateUpdates(batch, { continueOnError: true })
                await setRetroSyncLastProcessedTime(lastSeen)
                this.maybeInterruptSyncStream()
            }
        } catch (err) {
            this.handleSyncStreamError(err)
        } finally {
            releaseMutex()
        }

        await setRetroSyncLastProcessedTime(Date.now())
    }

    interruptSyncStream: CloudSyncAPI['interruptSyncStream'] = async () => {
        this.shouldInterruptStream = true
    }
}
