import { COLLECTION_NAMES as READER_COLL_NAMES } from '@worldbrain/memex-storage/lib/reader/constants'

export const SYNC_STORAGE_AREA_KEYS = {
    continuousSyncEnabled: 'enable-continuous-sync',
    deviceId: 'device-id',
}

export const AUTO_SYNC_TIMEOUT = 1000
export const AUTO_SYNC_COLLECTIONS: { [collection: string]: boolean } = {
    annotBookmarks: true,
    annotListEntries: true,
    annotations: true,
    bookmarks: true,
    customLists: true,
    favIcons: true,
    pageListEntries: true,
    pages: true,
    tags: true,
    visits: true,
    // TODO: Confirm we want to sync these
    [READER_COLL_NAMES.readable]: false,

    clientSyncLogEntry: false,
    settings: false,
    syncDeviceInfo: false,
}
