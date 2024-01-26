import type { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { WorldbrainAuthService } from '@worldbrain/memex-common/lib/authentication/worldbrain'
import type { ErrorTrackingService } from '../error-tracking'
import { AuthenticatedUser } from '@worldbrain/memex-common/lib/authentication/types'

export class MemexGoAuthService extends WorldbrainAuthService {
    setupOnChangedListener(
        onChanged: (user: AuthenticatedUser | null) => void,
    ) {
        this.events.on('changed', ({ user }) => onChanged(user))
    }

    async useiOSAccessGroup(userAccessGroup: string) {
        const authAPI = (this.deps.firebase.getAuth() as unknown) as FirebaseAuthTypes.Module

        if (typeof authAPI.useUserAccessGroup === 'function') {
            return authAPI.useUserAccessGroup(userAccessGroup)
        }
    }
}
