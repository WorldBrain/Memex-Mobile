export interface ErrorTracker {
    track(error: Error): void
}

export interface ErrorTrackerProps {
    dsn: string
}
