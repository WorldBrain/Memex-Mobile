import StorageManager from "@worldbrain/storex";

export type StorageBackendType = 'memory' | 'local'

export interface Storage {
    manager : StorageManager
}
