import StorageManager from "@worldbrain/storex";
import { TodoListStorage } from "src/features/example/storage";

export type StorageBackendType = 'memory' | 'local'

export interface Storage {
    manager : StorageManager
    modules : StorageModules
}

export interface StorageModules {
    todoList : TodoListStorage
}
