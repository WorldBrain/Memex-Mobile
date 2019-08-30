export interface LocalStorageAPI {
    get<T = any>(keyName: string): Promise<T | null>
    set<T = any>(keyName: string, value: T): Promise<void>
    clear(keyName: string): Promise<void>
}
