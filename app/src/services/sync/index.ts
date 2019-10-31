import StorageManager from '@worldbrain/storex'
const WebRTC = require('react-native-webrtc')

import { SharedSyncLog } from '@worldbrain/storex-sync/lib/shared-sync-log'
import { SyncLoggingMiddleware } from '@worldbrain/storex-sync/lib/logging-middleware'
import { SyncSettingsStore } from '@worldbrain/storex-sync/lib/integration/settings'
import { SYNCED_COLLECTIONS } from '@worldbrain/memex-common/lib/sync/constants'
import {
    MemexInitialSync,
    MemexContinuousSync,
    SyncSecretStore,
} from '@worldbrain/memex-common/lib/sync'
import { MemexSyncSetting } from '@worldbrain/memex-common/lib/sync/types'

import '../../polyfills'
import { AuthService } from '../auth/types'
import { LocalStorageService } from '../local-storage'
import { MemexClientSyncLogStorage } from 'src/features/sync/storage'

export default class SyncService {
    readonly syncedCollections: string[] = SYNCED_COLLECTIONS

    initialSync: MemexInitialSync
    continuousSync: MemexContinuousSync
    settingStore: MemexSyncSettingStore
    secretStore: SyncSecretStore
    syncLoggingMiddleware?: SyncLoggingMiddleware

    constructor(
        private options: {
            auth: AuthService
            storageManager: StorageManager
            signalTransportFactory: SignalTransportFactory
            localStorage: LocalStorageService
            clientSyncLog: MemexClientSyncLogStorage
            sharedSyncLog: SharedSyncLog
        },
    ) {
        this.settingStore = new MemexSyncSettingStore(options)
        this.secretStore = new SyncSecretStore({
            settingStore: this.settingStore,
        })

        this.initialSync = new MemexInitialSync({
            storageManager: options.storageManager,
            signalTransportFactory: options.signalTransportFactory,
            syncedCollections: this.syncedCollections,
            secrectStore: this.secretStore,
        })
        this.initialSync.wrtc = WebRTC
        this.continuousSync = new MemexContinuousSync({
            auth: {
                getUserId: async () => {
                    const user = await options.auth.getCurrentUser()
                    return user && user.id
                },
            },
            storageManager: options.storageManager,
            clientSyncLog: this.options.clientSyncLog,
            getSharedSyncLog: async () => this.options.sharedSyncLog,
            settingStore: this.settingStore,
            secretStore: this.secretStore,
            toggleSyncLogging: (
                enabled: boolean,
                deviceId?: string | number,
            ) => {
                if (this.syncLoggingMiddleware) {
                    this.syncLoggingMiddleware.enabled = enabled
                    if (enabled) {
                        this.syncLoggingMiddleware.deviceId = deviceId!
                    }
                } else {
                    throw new Error(
                        `Tried to toggle sync logging before logging middleware was created`,
                    )
                }
            },
        })
    }

    async createSyncLoggingMiddleware() {
        this.syncLoggingMiddleware = new SyncLoggingMiddleware({
            storageManager: this.options.storageManager,
            clientSyncLog: this.options.clientSyncLog,
            includeCollections: this.syncedCollections,
        })
        this.syncLoggingMiddleware.enabled = false
        return this.syncLoggingMiddleware
    }
}

class MemexSyncSettingStore implements SyncSettingsStore {
    constructor(private options: { localStorage: LocalStorageService }) {}

    async retrieveSetting(key: MemexSyncSetting) {
        return this.options.localStorage.get(key)
    }
    async storeSetting(
        key: MemexSyncSetting,
        value: boolean | number | string | null,
    ) {
        await this.options.localStorage.set(key, value)
    }
}
