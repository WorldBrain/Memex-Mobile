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

    private _process?: () => Promise<void>
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

    scheduleProcess(process: BackgroundProcess) {
        this._process = async () => {
            const { newData } = await process()

            this.backgroundAPI.finish(
                newData
                    ? this.backgroundAPI.FETCH_RESULT_NEW_DATA
                    : this.backgroundAPI.FETCH_RESULT_NO_DATA,
            )
        }

        this.scheduleSetProcess()
    }

    forceRun() {
        if (!this._process) {
            throw new Error('No process scheduled to run.')
        }

        return this._process()
    }

    pause(): () => void {
        if (!this._process) {
            throw new Error('No process scheduled to pause.')
        }

        this.backgroundAPI.stop()

        return this.scheduleSetProcess
    }

    private scheduleSetProcess = () =>
        this.backgroundAPI.configure(
            this.config,
            this._process!,
            this.handleProcessErrors,
        )

    private handleProcessErrors = (status: BackgroundFetchStatus) => {
        console.error('Background processing encountered an error.')

        if (status === this.backgroundAPI.STATUS_RESTRICTED) {
            console.error(
                'Background processing is currently unavailable due to device restriction settings (i.e., parental controls).',
            )
        } else if (status === this.backgroundAPI.STATUS_DENIED) {
            console.error(
                'Background processing is currently disabled for this app or the whole system.',
            )
        }
    }
}
