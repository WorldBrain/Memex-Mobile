import type Sentry from '@sentry/react-native'
import type { ErrorTracker, ErrorTrackerProps } from './types'
import type { AuthenticatedUser } from '@worldbrain/memex-common/lib/authentication/types'

export class ErrorTrackingService implements ErrorTracker {
    constructor(private api: typeof Sentry, props: ErrorTrackerProps) {
        this.api.init({ dsn: props.dsn })
    }

    setUser(user: AuthenticatedUser | null) {
        this.api.setUser(
            user ? { id: user.id, email: user.email ?? undefined } : null,
        )
    }

    track(err: Error) {
        this.api.captureException(err)
    }
}
