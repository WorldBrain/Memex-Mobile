import type TypedEventEmitter from 'typed-emitter'

export interface CloudSyncAPI {
    ____wipeDBForSync: () => Promise<void>
    sync: () => Promise<{ totalChanges: number }>
    syncStream: () => Promise<void>
    retrospectiveSync: () => Promise<void>
    interruptSyncStream: () => Promise<void>
    events: TypedEventEmitter<{
        syncStatsChanged(event: { stats: SyncStats }): void
    }>
}

export interface SyncStats {
    totalDownloads: number | null
    pendingDownloads: number | null
    // pendingUploads: number
}
