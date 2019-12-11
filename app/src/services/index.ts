import { SharedSyncLog } from '@worldbrain/storex-sync/lib/shared-sync-log'
import { SignalTransportFactory } from '@worldbrain/memex-common/lib/sync'
import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'
import { MemexSyncDevicePlatform } from '@worldbrain/memex-common/lib/sync/types'

import { Services } from './types'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'
import SyncService from './sync'
import { Storage } from 'src/storage/types'
import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'
import { MemexSyncDevicePlatform } from '@worldbrain/memex-common/lib/sync/types'

export interface CreateServicesOptions {
    storage: Storage
    signalTransportFactory: SignalTransportFactory
    sharedSyncLog: SharedSyncLog
    auth: AuthService
    localStorage: LocalStorageService
    devicePlatform: MemexSyncDevicePlatform
}

export async function createServices(
    options: CreateServicesOptions,
): Promise<Services> {
    const localStorage = options.localStorage
    const services = {
        auth: options.auth,
        shareExt: new ShareExtService({}),
        localStorage,
        sync: new SyncService({
            devicePlatform: options.devicePlatform,
            signalTransportFactory: options.signalTransportFactory,
            storageManager: options.storage.manager,
            clientSyncLog: options.storage.modules.clientSyncLog,
            syncInfoStorage: options.storage.modules.syncInfo,
            getSharedSyncLog: async () => options.sharedSyncLog,
            auth: options.auth,
            disableEncryption: options.devicePlatform === 'integration-tests',
            localStorage,
        }),
    }
    return services
}
