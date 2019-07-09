import StorageManager from '@worldbrain/storex'

import { TodoListStorage } from 'src/features/example/storage'
import { OverviewStorage } from 'src/features/overview/storage'
import { MetaPickerStorage } from 'src/features/meta-picker/storage'

export type StorageBackendType = 'memory' | 'local'

export interface Storage {
    manager: StorageManager
    modules: StorageModules
}

export interface StorageModules {
    todoList: TodoListStorage
    overview: OverviewStorage
    metaPicker: MetaPickerStorage
}
