import { AuthService, AuthenticatedUser, AuthServiceEvents } from './types'
import { LocalStorageService } from '../local-storage'
import { EventEmitter } from 'events'
import TypedEventEmitter from 'typed-emitter'

export class MemoryAuthService implements AuthService {
    public events = new EventEmitter() as TypedEventEmitter<AuthServiceEvents>

    protected currentUser: AuthenticatedUser | null = null

    async setUser(user: AuthenticatedUser | null) {
        this.currentUser = user
    }

    async getCurrentUser(): Promise<AuthenticatedUser | null> {
        return this.currentUser
    }

    async generateLoginToken() {
        return {
            token: JSON.stringify({
                authMockToken: true,
                user: this.currentUser,
            }),
        }
    }

    async loginWithToken(token: string) {
        const parsed = JSON.parse(token)
        if (!parsed.authMockToken) {
            throw new Error(`Tried to log in with invalid token: ` + token)
        }
        this.currentUser = parsed.user
    }

    async refreshUserInfo(): Promise<void> {}
}
