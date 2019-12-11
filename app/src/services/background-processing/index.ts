import BackgroundFetch, {
    BackgroundFetchConfig,
    BackgroundFetchStatus,
} from 'react-native-background-fetch'

import { BackgroundProcess } from './types'

export interface Props {
    backgroundAPI?: typeof BackgroundFetch
    processingIntervalMin?: number
    startOnBoot?: boolean
    stopOnAppTerminate?: boolean
}

export class BackgroundProcessService {
    static DEF_PROCESSING_INTERVAL_MIN = 15

    private backgroundAPI: typeof BackgroundFetch
    private config: BackgroundFetchConfig

    constructor({
        backgroundAPI = BackgroundFetch,
        processingIntervalMin = BackgroundProcessService.DEF_PROCESSING_INTERVAL_MIN,
        stopOnAppTerminate = false,
        startOnBoot = true,
    }: Props) {
        this.backgroundAPI = backgroundAPI
        this.config = {
            minimumFetchInterval: processingIntervalMin,
            startOnBoot,
            stopOnTerminate: stopOnAppTerminate,
        }
    }

    async scheduleProcess(process: BackgroundProcess) {
        this.backgroundAPI.configure(
            this.config,
            async () => {
                const { newData } = await process()

                this.backgroundAPI.finish(
                    newData
                        ? BackgroundFetch.FETCH_RESULT_NEW_DATA
                        : BackgroundFetch.FETCH_RESULT_NO_DATA,
                )
            },
            this.handleProcessErrors,
        )
    }

    private handleProcessErrors = (status: BackgroundFetchStatus) => {
        console.error('Background processing encountered an error.')

        if (status === BackgroundFetch.STATUS_RESTRICTED) {
            console.error(
                'Background processing is currently unavailable due to device restriction settings (i.e., parental controls).',
            )
        } else if (status === BackgroundFetch.STATUS_DENIED) {
            console.error(
                'Background processing is currently disabled for this app or the whole system.',
            )
        }
    }
}
