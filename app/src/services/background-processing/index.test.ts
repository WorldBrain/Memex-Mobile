import expect from 'expect'

import { BackgroundProcessService } from '.'
import { BackgroundProcess } from './types'

export class MockBackgroundFetch {
    FETCH_RESULT_NEW_DATA = 0
    FETCH_RESULT_NO_DATA = 1
    STATUS_RESTRICTED = 0
    STATUS_DENIED = 1

    finishSignal?: number
    isStopped = false
    conf: any
    process?: BackgroundProcess
    errorHandler?: (status: number) => void
    configureCalledTimes = 0

    finish(signal: number) {
        this.finishSignal = signal
    }

    stop() {
        this.isStopped = true
    }

    configure(
        conf: any,
        process: BackgroundProcess,
        handleErrors: (status: number) => void,
    ) {
        this.configureCalledTimes++

        this.conf = conf
        this.process = process
        this.errorHandler = handleErrors
    }
}

describe('BackgroundProcessService', () => {
    async function setupTest() {
        const backgroundAPI = new MockBackgroundFetch()
        const service = new BackgroundProcessService({
            backgroundAPI: backgroundAPI as any,
        })

        return { service, backgroundAPI }
    }

    it('should be able to schedule a background process', async () => {
        const { service, backgroundAPI } = await setupTest()

        const testProcess: BackgroundProcess = async () => ({ newData: true })

        expect(service['_process']).not.toBeDefined()
        service.scheduleProcess(testProcess)
        expect(service['_process']).toBeDefined()

        expect(backgroundAPI.conf).toEqual(service['config'])

        expect(backgroundAPI.finishSignal).not.toBeDefined()
        await service.forceRun()
        expect(backgroundAPI.finishSignal).toEqual(
            backgroundAPI.FETCH_RESULT_NEW_DATA,
        )
    })

    it('should be able to pause and resume a background process', async () => {
        const { service, backgroundAPI } = await setupTest()

        const testProcess: BackgroundProcess = async () => ({ newData: true })

        expect(service.pause).toThrowError()

        service.scheduleProcess(testProcess)

        expect(backgroundAPI.isStopped).toBe(false)
        const resume = service.pause()
        expect(backgroundAPI.isStopped).toBe(true)
        expect(backgroundAPI.configureCalledTimes).toBe(1)
        resume()
        expect(backgroundAPI.configureCalledTimes).toBe(2)
    })
})
