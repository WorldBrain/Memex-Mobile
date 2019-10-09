import StorageManager from '@worldbrain/storex'
import { COLLECTION_NAMES as PAGES_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/pages/constants'
import { COLLECTION_NAMES as TAGS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/tags/constants'
import { COLLECTION_NAMES as LISTS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/lists/constants'
import { COLLECTION_NAMES as ANNOTATIONS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/annotations/constants'
import ContinousSync from './continuous-sync'
import InitialSync, { SignalTransportFactory } from './initial-sync'

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

    public initialSync: InitialSync
    public continousSync: ContinousSync

    constructor(options: {
        // auth: AuthBackground
        storageManager: StorageManager
        signalTransportFactory: SignalTransportFactory
        // sharedSyncLog: SharedSyncLog
        // browserAPIs: Pick<Browser, 'storage'>
    }) {
        this.initialSync = new InitialSync({
            storageManager: options.storageManager,
            signalTransportFactory: options.signalTransportFactory,
            syncedCollections: this.syncedCollections,
        })
        this.continousSync = new ContinousSync()
    }
}
