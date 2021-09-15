import type { ReactNativeFirebase } from '@react-native-firebase/app'
import FirebaseFunctionsActivityStreamsService from '@worldbrain/memex-common/lib/activity-streams/services/firebase-functions/client'
import MemoryStreamsService from '@worldbrain/memex-common/lib/activity-streams/services/memory'
import type { FunctionsBackendServices } from '@worldbrain/memex-common/lib/firebase-backend/types'
import { ServerStorage } from 'src/storage/types'
import { MemoryAuthService } from '@worldbrain/memex-common/lib/authentication/memory'

export type ServerServices = Pick<FunctionsBackendServices, 'activityStreams'>

export async function createServerServices(options: {
    getServerStorage: () => Promise<ServerStorage>
    firebase?: ReactNativeFirebase.Module
}): Promise<ServerServices> {
    const { modules: storageModules } = await options.getServerStorage()

    if (options.firebase) {
        return {
            activityStreams: new FirebaseFunctionsActivityStreamsService({
                executeCall: async (name, params) => {
                    const functions = options.firebase!.functions()
                    const result = await functions.httpsCallable(name)(params)
                    return result.data
                },
            }),
        }
    }

    const auth = new MemoryAuthService()
    return {
        activityStreams: new MemoryStreamsService({
            storage: {
                contentConversations: storageModules.contentConversations,
                contentSharing: storageModules.contentSharing,
                users: storageModules.userManagement,
            },
            getCurrentUserId: async () =>
                (await auth.getCurrentUser())?.id ?? null,
        }),
    }
}
