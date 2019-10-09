import { AuthService, AuthenticatedUser } from './types'

export class MemoryAuthService implements AuthService {
    private currentUser: AuthenticatedUser | null = null

    setUser(user: AuthenticatedUser | null) {
        this.currentUser = user
    }

    async getCurrentUser(): Promise<AuthenticatedUser | null> {
        return this.currentUser
    }
}
