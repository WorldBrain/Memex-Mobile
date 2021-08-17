export interface CloudSyncAPI {
    sync: () => Promise<{ totalChanges: number }>
}
