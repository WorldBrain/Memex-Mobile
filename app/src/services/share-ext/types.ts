export interface SharedData {
    type: string
    value: string
}

export interface ShareAPI {
    data(): Promise<SharedData>
    close(): Promise<void>
    openURL(url: string): void
}
