import StorageManager from '@worldbrain/storex'

import { ContentSharingClientStorage } from '@worldbrain/memex-common/lib/content-sharing/client-storage'
import { OverviewStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/overview/storage'
import { MetaPickerStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/storage'
import { PageEditorStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/page-editor/storage'
import {
    MemexClientSyncLogStorage,
    MemexSyncInfoStorage,
} from 'src/features/sync/storage'
import { SettingsStorage } from 'src/features/settings/storage'
import { ReaderStorage } from 'src/features/reader/storage'
import { PersonalCloudStorage } from 'src/features/personal-cloud/storage'
import { CopyPasterStorage } from 'src/features/copy-paster/storage'

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
    settings: SettingsStorage
    reader: ReaderStorage
}
