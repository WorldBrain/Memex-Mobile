import StorageManager from '@worldbrain/storex'
import { COLLECTION_NAMES as PAGES_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/pages/constants'
import { COLLECTION_NAMES as TAGS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/tags/constants'
import { COLLECTION_NAMES as LISTS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/lists/constants'
import { COLLECTION_NAMES as ANNOTATIONS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/annotations/constants'
import ContinousSync from './continuous-sync'
import InitialSync, { SignalTransportFactory } from './initial-sync'
import { LocalStorageService } from '../local-storage'
import { AuthService } from '../auth/types'
import { SharedSyncLog } from '@worldbrain/storex-sync/lib/shared-sync-log'
import { SyncLoggingMiddleware } from '@worldbrain/storex-sync/lib/logging-middleware'
import { MemexClientSyncLogStorage } from 'src/features/sync/storage'

export default class SyncService {
    readonly syncedCollections: string[] = [
        PAGES_COLLECTION_NAMES.bookmark,
        PAGES_COLLECTION_NAMES.page,
        PAGES_COLLECTION_NAMES.visit,
        TAGS_COLLECTION_NAMES.tag,
        LISTS_COLLECTION_NAMES.list,
        LISTS_COLLECTION_NAMES.listEntry,
        ANNOTATIONS_COLLECTION_NAMES.annotation,
        ANNOTATIONS_COLLECTION_NAMES.listEntry,
        ANNOTATIONS_COLLECTION_NAMES.bookmark,
    ]

    initialSync: InitialSync
    continousSync: ContinousSync
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
        this.initialSync = new InitialSync({
            storageManager: options.storageManager,
            signalTransportFactory: options.signalTransportFactory,
            syncedCollections: this.syncedCollections,
        })
        this.continousSync = new ContinousSync({
            auth: options.auth,
            storageManager: options.storageManager,
            clientSyncLog: this.options.clientSyncLog,
            sharedSyncLog: options.sharedSyncLog,
            settingStore: {
                storeSetting: (key, value) =>
                    options.localStorage.set(key, value),
                retrieveSetting: key => options.localStorage.get(key),
            },
            toggleSyncLogging: (enabed: boolean) => {
                if (this.syncLoggingMiddleware) {
                    this.syncLoggingMiddleware.enabled = enabed
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
