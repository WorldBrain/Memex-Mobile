export interface CloudSyncAPI {
    ____wipeDBForSync: () => Promise<void>
    sync: () => Promise<{ totalChanges: number }>
    syncStream: () => Promise<void>
}
