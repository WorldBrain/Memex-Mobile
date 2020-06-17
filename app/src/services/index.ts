import { SharedSyncLog } from '@worldbrain/storex-sync/lib/shared-sync-log'
import { SignalTransportFactory } from '@worldbrain/memex-common/lib/sync'
import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'
import { MemexSyncDevicePlatform } from '@worldbrain/memex-common/lib/sync/types'

import { Services } from './types'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'
import { ErrorTrackingService } from './error-tracking'
import SyncService from './sync'
import { Storage } from 'src/storage/types'
import { BackgroundProcessService } from './background-processing'
import { KeychainService } from './keychain'
import { KeychainAPI } from './keychain/types'
import { ReadabilityService } from './readability'
import { ResourceLoaderService } from './resource-loader'

export interface CreateServicesOptions {
    storage: Storage
    signalTransportFactory: SignalTransportFactory
    sharedSyncLog: SharedSyncLog
    auth: AuthService
    keychain: KeychainAPI
    errorTracker: ErrorTrackingService
    localStorage: LocalStorageService
    devicePlatform: MemexSyncDevicePlatform
    disableSyncEncryption?: boolean
}

export async function createServices(
    options: CreateServicesOptions,
): Promise<Services> {
    const localStorage = options.localStorage
    return {
        auth: options.auth,
        shareExt: new ShareExtService({}),
        backgroundProcess: new BackgroundProcessService({}),
        keychain: new KeychainService({ keychain: options.keychain }),
        errorTracker: options.errorTracker,
        readability: new ReadabilityService({}),
        localStorage,
        resourceLoader: new ResourceLoaderService({}),
        sync: new SyncService({
            devicePlatform: options.devicePlatform,
            signalTransportFactory: options.signalTransportFactory,
            storageManager: options.storage.manager,
            clientSyncLog: options.storage.modules.clientSyncLog,
            syncInfoStorage: options.storage.modules.syncInfo,
            getSharedSyncLog: async () => options.sharedSyncLog,
            auth: options.auth,
            disableEncryption: options.disableSyncEncryption,
            localStorage,
            errorTracker: options.errorTracker,
        }),
    }
}
