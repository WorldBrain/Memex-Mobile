import type { AuthenticatedUser } from '@worldbrain/memex-common/lib/authentication/types'

export class MockSentry {
    user: { id: string; email?: string } | null = null
    initArgs: any
    captured: any[] = []

    init(args: any) {
        this.initArgs = args
    }

    setUser(user: AuthenticatedUser | null) {
        console.log('DEV: Setting sentry user:', user)
        this.user = user
            ? { id: user.id, email: user.email ?? undefined }
            : null
    }

    captureException(err: any) {
        this.captured.push(err)
    }
}
