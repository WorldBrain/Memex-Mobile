import StorageManager from '@worldbrain/storex'
import { COLLECTION_NAMES as PAGES_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/pages/constants'
import { COLLECTION_NAMES as TAGS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/tags/constants'
import { COLLECTION_NAMES as LISTS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/lists/constants'
import { COLLECTION_NAMES as ANNOTATIONS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/annotations/constants'
import { COLLECTION_NAMES as TEMPLATE_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/copy-paster/constants'
import { COLLECTION_NAMES as READER_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/reader/constants'
import { COLLECTION_NAMES as SHARING_COLLECTION_NAMES } from '@worldbrain/memex-common/lib/content-sharing/client-storage'
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
    READER_COLLECTION_NAMES.readablePage,
    SHARING_COLLECTION_NAMES.annotationPrivacy,
    SHARING_COLLECTION_NAMES.annotationMetadata,
    SHARING_COLLECTION_NAMES.listMetadata,
    'personalCloudAction',
]

export async function dangerousPleaseBeSureDeleteAndRecreateDatabase(
    storageManager: StorageManager,
    collectionsToDelete = USER_DATA_COLLECTIONS,
) {
    await storageManager.backend.operation(
        'executeBatch',
        collectionsToDelete.map((collection) => ({
            operation: 'deleteObjects',
            collection,
            where: {},
        })),
    )
}
