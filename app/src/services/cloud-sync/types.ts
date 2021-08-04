export interface CloudSyncAPI {
    runInitialSync: () => Promise<void>
    runContinuousSync: () => Promise<void>
}
