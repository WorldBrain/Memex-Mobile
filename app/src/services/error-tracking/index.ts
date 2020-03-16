import * as Sentry from '@sentry/react-native'

import { ErrorTracker, ErrorTrackerProps } from './types'

export class ErrorTrackingService implements ErrorTracker {
    constructor(private api: typeof Sentry, props: ErrorTrackerProps) {
        this.api.init({ dsn: props.dsn })
    }

    track(err: Error) {
        this.api.captureException(err)
    }
}
