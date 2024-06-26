import { COLLECTION_NAMES as PAGES_COLLECTION_NAMES } from '@worldbrain/memex-common/lib/storage/modules/pages/constants'
import { COLLECTION_NAMES as TAGS_COLLECTION_NAMES } from '@worldbrain/memex-common/lib/storage/modules/tags/constants'
import { COLLECTION_NAMES as LISTS_COLLECTION_NAMES } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import { COLLECTION_NAMES as FOLLOWED_LISTS_COLLECTION_NAMES } from '@worldbrain/memex-common/lib/storage/modules/followed-lists/constants'
import { COLLECTION_NAMES as ANNOTATIONS_COLLECTION_NAMES } from '@worldbrain/memex-common/lib/storage/modules/annotations/constants'
import { COLLECTION_NAMES as CONTENT_SHARING_COLLECTION_NAMES } from '@worldbrain/memex-common/lib/content-sharing/client-storage'
import { SettingsStorage } from 'src/features/settings/storage'

export const PERSONAL_CLOUD_ACTION_RETRY_INTERVAL = 1000 * 60 * 5

export const CLOUD_SYNCED_COLLECTIONS: string[] = [
    PAGES_COLLECTION_NAMES.locator,
    PAGES_COLLECTION_NAMES.bookmark,
    PAGES_COLLECTION_NAMES.visit,
    PAGES_COLLECTION_NAMES.page,
    PAGES_COLLECTION_NAMES.pageEntity,
    PAGES_COLLECTION_NAMES.pageMetadata,
    TAGS_COLLECTION_NAMES.tag,
    LISTS_COLLECTION_NAMES.list,
    LISTS_COLLECTION_NAMES.listTrees,
    LISTS_COLLECTION_NAMES.listEntry,
    LISTS_COLLECTION_NAMES.listTrees,
    LISTS_COLLECTION_NAMES.listDescription,
    SettingsStorage.SYNC_SETTINGS_COLL_NAME,
    ANNOTATIONS_COLLECTION_NAMES.annotation,
    ANNOTATIONS_COLLECTION_NAMES.listEntry,
    FOLLOWED_LISTS_COLLECTION_NAMES.followedList,
    FOLLOWED_LISTS_COLLECTION_NAMES.followedListEntry,
    CONTENT_SHARING_COLLECTION_NAMES.listMetadata,
    CONTENT_SHARING_COLLECTION_NAMES.annotationPrivacy,
    CONTENT_SHARING_COLLECTION_NAMES.annotationMetadata,
]
