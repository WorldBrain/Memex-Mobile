import type TypedEventEmitter from 'typed-emitter'

export interface CloudSyncAPI {
    ____wipeDBForSync: () => Promise<void>
    sync: () => Promise<{ totalChanges: number }>
    syncStream: () => Promise<void>
    endSyncStream: () => Promise<void>
    events: TypedEventEmitter<{
        syncStatsChanged(event: { stats: SyncStats }): void
    }>
}

export interface SyncStats {
    pendingDownloads: number
    pendingUploads: number
}
