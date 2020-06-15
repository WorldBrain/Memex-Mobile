import { WorldbrainAuthService } from '@worldbrain/memex-common/lib/authentication/worldbrain'

export class MemexGoAuthService extends WorldbrainAuthService {
    async useiOSAccessGroup(userAccessGroup: string) {
        const authAPI = this['firebase'].auth()

        if (typeof authAPI.useUserAccessGroup === 'function') {
            return authAPI.useUserAccessGroup(userAccessGroup)
        }
    }
}
