import { AuthService, AuthenticatedUser } from './types'
import { LocalStorageService } from '../local-storage'

export class LocalAuthService implements AuthService {
    private currentUser: AuthenticatedUser | null = null
    private initialized = false

    constructor(private options: { localStorage: LocalStorageService }) {}

    async setUser(user: AuthenticatedUser | null) {
        await this.options.localStorage.set('test-user-id', user && user.id)
        this.currentUser = user
    }

    async getCurrentUser(): Promise<AuthenticatedUser | null> {
        if (!this.initialized) {
            const userId =
                (await this.options.localStorage.get('test-user-id')) || null
            this.currentUser = userId && { id: userId }
            this.initialized = true
        }
        return this.currentUser
    }
}
