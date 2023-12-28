import EventEmitter from 'events'
import type StorageManager from '@worldbrain/storex'
import { AsyncMutex } from '@worldbrain/memex-common/lib/utils/async-mutex'
import { dangerousPleaseBeSureDeleteAndRecreateDatabase } from 'src/storage/utils'
import type { PersonalCloudStorage } from 'src/features/personal-cloud/storage'
import type { PersonalCloudBackend } from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import type { CloudSyncAPI, SyncStats } from './types'
import type { ErrorTrackingService } from '../error-tracking'
import { COLLECTION_NAMES as ANNOTATIONS_COLLECTION_NAMES } from '@worldbrain/memex-common/lib/storage/modules/annotations/constants'
import { COLLECTION_NAMES as CONTENT_SHARING_COLLECTION_NAMES } from '@worldbrain/memex-common/lib/content-sharing/client-storage'

export interface Props {
    backend: PersonalCloudBackend
    storage: PersonalCloudStorage
    storageManager: StorageManager
    errorTrackingService: ErrorTrackingService
    setSyncLastProcessedTime(time: number): Promise<void>
    setRetroSyncLastProcessedTime(time: number): Promise<void>
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
        downloadProgress: 0,
    }

    constructor(private props: Props) {
        props.backend.events.on('incomingChangesPending', (event) => {
            console.log('incomingChangesPending', event.changeCountDelta)
            this._modifyStats({
                totalDownloads: event.changeCountDelta,
                downloadProgress: 0,
            })
        })
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
            totalDownloads: null,
            downloadProgress: null,
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

        let totalDownloads = 0
        for await (const { totalCount } of backend.countChanges()) {
            totalDownloads = totalCount
        }
        this._modifyStats({ totalDownloads })

        try {
            for await (const { batch, lastSeen } of backend.streamUpdates({
                skipUserChangeListening: true,
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
        const { storage, backend, setRetroSyncLastProcessedTime } = this.props

        const collectionsToRetroSync = [
            ANNOTATIONS_COLLECTION_NAMES.listEntry,
            CONTENT_SHARING_COLLECTION_NAMES.listMetadata,
            CONTENT_SHARING_COLLECTION_NAMES.annotationPrivacy,
            CONTENT_SHARING_COLLECTION_NAMES.annotationMetadata,
        ]
        const { releaseMutex } = await this.syncStreamMutex.lock()
        await storage.loadDeviceId()

        try {
            for await (const {
                batch,
                lastSeen,
            } of backend.streamCollectionData({
                collectionNames: collectionsToRetroSync,
            })) {
                this.maybeInterruptSyncStream()
                await storage.integrateUpdates(batch)
                await setRetroSyncLastProcessedTime(lastSeen)
                this.maybeInterruptSyncStream()
            }
        } catch (err) {
            this.handleSyncStreamError(err)
        } finally {
            releaseMutex()
        }
    }

    interruptSyncStream: CloudSyncAPI['interruptSyncStream'] = async () => {
        this.shouldInterruptStream = true
    }
}
