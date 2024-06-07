export interface BackgroundProcessResult {
    /** Denotes whether or not the DB was written to during processing. */
    newData: boolean
}

export type BackgroundProcess = () => Promise<BackgroundProcessResult>
