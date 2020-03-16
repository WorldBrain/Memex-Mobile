import { ErrorTrackingService } from '.'
import { MockSentry } from './index.tests'

function setup() {
    const mockSentry = new MockSentry()
    const service = new ErrorTrackingService(mockSentry as any, {
        dsn: 'test.com',
    })

    return { service, mockSentry }
}

describe('error tracking service', () => {
    it('should be able to track errors', () => {
        const { mockSentry, service } = setup()

        const errMsg = 'test'
        const testFn = () => {
            throw new Error(errMsg)
        }
        const runTestFnWithErrHandling = () => {
            try {
                testFn()
            } catch (err) {
                service.track(err)
            }
        }

        expect(mockSentry.captured.length).toBe(0)

        runTestFnWithErrHandling()
        expect(mockSentry.captured.length).toBe(1)
        expect(mockSentry.captured[0].message).toEqual(errMsg)

        runTestFnWithErrHandling()
        expect(mockSentry.captured.length).toBe(2)
        expect(mockSentry.captured[1].message).toEqual(errMsg)
    })
})
