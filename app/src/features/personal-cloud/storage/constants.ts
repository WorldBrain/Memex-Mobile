import { COLLECTION_NAMES as PAGES_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/pages/constants'
import { COLLECTION_NAMES as TAGS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/tags/constants'
import { COLLECTION_NAMES as LISTS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/lists/constants'
import { COLLECTION_NAMES as ANNOTATIONS_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/annotations/constants'
import { COLLECTION_NAMES as TEMPLATE_COLLECTION_NAMES } from '@worldbrain/memex-storage/lib/copy-paster/constants'
import { SettingsStorage } from 'src/features/settings/storage'

export const PERSONAL_CLOUD_ACTION_RETRY_INTERVAL = 1000 * 60 * 5

export const CLOUD_SYNCED_COLLECTIONS: string[] = [
    PAGES_COLLECTION_NAMES.bookmark,
    PAGES_COLLECTION_NAMES.visit,
    PAGES_COLLECTION_NAMES.page,
    TAGS_COLLECTION_NAMES.tag,
    LISTS_COLLECTION_NAMES.list,
    LISTS_COLLECTION_NAMES.listEntry,
    SettingsStorage.SYNC_SETTINGS_COLL_NAME,
    TEMPLATE_COLLECTION_NAMES.templates,
    ANNOTATIONS_COLLECTION_NAMES.annotation,
    ANNOTATIONS_COLLECTION_NAMES.annotationPrivacy,
    'syncDeviceInfo',
    'sharedListMetadata',
    'sharedAnnotationMetadata',
]
