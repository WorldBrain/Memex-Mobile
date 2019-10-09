import AsyncStorage from '@react-native-community/async-storage'
import StorageManager from '@worldbrain/storex'

import { Services } from './types'
import { WorldBrainAuthService } from './auth/wb-auth'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'
import SyncService from './sync'
import { SignalTransportFactory } from './sync/initial-sync'

export interface CreateServicesOptions {
    storageManager: StorageManager
    signalTransportFactory: SignalTransportFactory
}

export async function createServices(
    options: CreateServicesOptions,
): Promise<Services> {
    return {
        auth: new WorldBrainAuthService(),
        shareExt: new ShareExtService({}),
        localStorage: new LocalStorageService({ storageAPI: AsyncStorage }),
        sync: new SyncService(options),
    }
}
