import StorageManager from '@worldbrain/storex'

import { OverviewStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/overview/storage'
import { MetaPickerStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/storage'
import { PageEditorStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/page-editor/storage'
import {
    MemexClientSyncLogStorage,
    MemexSyncInfoStorage,
} from 'src/features/sync/storage'

export interface Storage {
    manager: StorageManager
    modules: StorageModules
}

export interface StorageModules {
    overview: OverviewStorage
    metaPicker: MetaPickerStorage
    pageEditor: PageEditorStorage
    clientSyncLog: MemexClientSyncLogStorage
    syncInfo: MemexSyncInfoStorage
}
