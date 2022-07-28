import type StorageManager from '@worldbrain/storex'

import type UserStorage from '@worldbrain/memex-common/lib/user-management/storage'
import type PersonalCloudServerStorage from '@worldbrain/memex-common/lib/personal-cloud/storage'
import type { ContentSharingClientStorage } from '@worldbrain/memex-common/lib/content-sharing/client-storage'
import type { OverviewStorage } from '@worldbrain/memex-common/lib/storage/modules/mobile-app/features/overview/storage'
import type { MetaPickerStorage } from '../features/meta-picker/storage'
import type { PageEditorStorage } from 'src/features/page-editor/storage'
import type {
    MemexClientSyncLogStorage,
    MemexSyncInfoStorage,
} from 'src/features/sync/storage'
import type { SettingsStorage } from 'src/features/settings/storage'
import type { ReaderStorage } from 'src/features/reader/storage'
import type { PersonalCloudStorage } from 'src/features/personal-cloud/storage'
import type { CopyPasterStorage } from 'src/features/copy-paster/storage'
import type ContentSharingStorage from '@worldbrain/memex-common/lib/content-sharing/storage'
import type ContentConversationStorage from '@worldbrain/memex-common/lib/content-conversations/storage'
import type { ActivityStreamsStorage } from '@worldbrain/memex-common/lib/activity-streams/storage/types'

export interface Storage {
    manager: StorageManager
    modules: StorageModules
}

export interface StorageModules {
    overview: OverviewStorage
    metaPicker: MetaPickerStorage
    pageEditor: PageEditorStorage
    copyPaster: CopyPasterStorage
    clientSyncLog: MemexClientSyncLogStorage
    contentSharing: ContentSharingClientStorage
    personalCloud: PersonalCloudStorage
    syncInfo: MemexSyncInfoStorage
    syncSettings: SettingsStorage
    localSettings: SettingsStorage
    reader: ReaderStorage
}

export interface ServerStorage {
    manager: StorageManager
    modules: ServerStorageModules
}

export interface ServerStorageModules {
    personalCloud: PersonalCloudServerStorage
    contentSharing: ContentSharingStorage
    userManagement: UserStorage
    activityStreams: ActivityStreamsStorage
    contentConversations: ContentConversationStorage
}
