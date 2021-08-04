export interface CloudSyncAPI {
    runInitialSync: () => Promise<void>
    runContinuousSync: () => Promise<ContinuousSyncResult>
}

export interface ContinuousSyncResult {
    totalChanges: number
}
