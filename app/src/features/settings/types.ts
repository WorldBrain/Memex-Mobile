export interface SettableSettings {
    setSetting(args: { key: string; value: any }): Promise<void>

    getSetting<T = any>(args: { key: string }): Promise<T | null>

    clearSetting(args: { key: string }): Promise<void>
}
