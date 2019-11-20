import StorageManager from '@worldbrain/storex'

import { OverviewStorage } from 'src/features/overview/storage'
import { MetaPickerStorage } from 'src/features/meta-picker/storage'
import { PageEditorStorage } from 'src/features/page-editor/storage'
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
