import StorageManager from '@worldbrain/storex'
import { COLLECTION_NAMES as PAGES_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/pages/constants'
import { COLLECTION_NAMES as TAGS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/tags/constants'
import { COLLECTION_NAMES as LISTS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/lists/constants'
import { COLLECTION_NAMES as ANNOTATIONS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/annotations/constants'
import { COLLECTION_NAMES as TEMPLATE_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/copy-paster/constants'
import { COLLECTION_NAMES as READER_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/reader/constants'
import { SettingsStorage } from 'src/features/settings/storage'

export const USER_DATA_COLLECTIONS: string[] = [
    PAGES_COLLECTION_NAMES.page,
    PAGES_COLLECTION_NAMES.bookmark,
    PAGES_COLLECTION_NAMES.visit,
    TAGS_COLLECTION_NAMES.tag,
    LISTS_COLLECTION_NAMES.list,
    LISTS_COLLECTION_NAMES.listEntry,
    SettingsStorage.SYNC_SETTINGS_COLL_NAME,
    TEMPLATE_COLLECTION_NAMES.templates,
    ANNOTATIONS_COLLECTION_NAMES.annotation,
    ANNOTATIONS_COLLECTION_NAMES.annotationPrivacy,
    READER_COLLECTION_NAMES.readablePage,
    'sharedAnnotationMetadata',
    'personalCloudAction',
    'sharedListMetadata',
]

export async function dangerousPleaseBeSureDeleteAndRecreateDatabase(
    storageManager: StorageManager,
    collectionsToDelete = USER_DATA_COLLECTIONS,
) {
    for (const collection of collectionsToDelete) {
        await storageManager.operation('deleteObjects', collection, {})
    }
}
