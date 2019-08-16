export interface LocalStorageAPI {
    get(keyName: string): Promise<string | null>
    set(keyName: string, value: string): Promise<void>
}
