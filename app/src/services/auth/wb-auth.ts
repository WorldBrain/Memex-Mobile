import { AuthService } from './types'

export class WorldBrainAuthService implements AuthService {
    async getCurrentUser() {
        return { id: 'not-implemented-yet (grep for me)' }
    }
}
