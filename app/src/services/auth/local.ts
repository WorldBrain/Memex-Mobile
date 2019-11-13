import { EventEmitter } from 'events'
import TypedEventEmitter from 'typed-emitter'
import { LocalStorageService } from '../local-storage'
import { AuthService, AuthenticatedUser, AuthServiceEvents } from './types'
import { MemoryAuthService } from './memory'

export class LocalAuthService extends MemoryAuthService {
    private initialized = false

    constructor(private options: { localStorage: LocalStorageService }) {
        super()
    }

    async setUser(user: AuthenticatedUser | null) {
        await this.options.localStorage.set(
            'test-user',
            user && JSON.stringify(user),
        )
        super.setUser(user)
    }

    async getCurrentUser(): Promise<AuthenticatedUser | null> {
        if (!this.initialized) {
            const serializeUser: string | null =
                (await this.options.localStorage.get('test-user')) || null
            this.currentUser = serializeUser && JSON.parse(serializeUser)
            this.initialized = true
        }
        return super.getCurrentUser()
    }
}
