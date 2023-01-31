import type { FirebaseAuthTypes } from '@react-native-firebase/auth'
import { WorldbrainAuthService } from '@worldbrain/memex-common/lib/authentication/worldbrain'

export class MemexGoAuthService extends WorldbrainAuthService {
    async useiOSAccessGroup(userAccessGroup: string) {
        const authAPI = (this.deps.firebase.getAuth() as unknown) as FirebaseAuthTypes.Module

        if (typeof authAPI.useUserAccessGroup === 'function') {
            return authAPI.useUserAccessGroup(userAccessGroup)
        }
    }
}
