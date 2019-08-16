import AsyncStorage from '@react-native-community/async-storage'

import { Services } from './types'
import { WorldBrainAuthService } from './auth/wb-auth'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'

export interface CreateServicesOptions {}

export async function createServices(
    options: CreateServicesOptions,
): Promise<Services> {
    return {
        auth: new WorldBrainAuthService(),
        shareExt: new ShareExtService({}),
        localStorage: new LocalStorageService({ storageAPI: AsyncStorage }),
    }
}
