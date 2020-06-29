import { SharedSyncLog } from '@worldbrain/storex-sync/lib/shared-sync-log'
import { SignalTransportFactory } from '@worldbrain/memex-common/lib/sync'
import { MemexSyncDevicePlatform } from '@worldbrain/memex-common/lib/sync/types'
import { URLNormalizer } from '@worldbrain/memex-url-utils'
import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'

import { Services } from './types'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'
import { ErrorTrackingService } from './error-tracking'
import SyncService from './sync'
import { Storage } from 'src/storage/types'
import { BackgroundProcessService } from './background-processing'
import { MemexGoAuthService } from './auth'
import { KeychainService } from './keychain'
import { KeychainAPI } from './keychain/types'
import { ReadabilityService } from './readability'
import { ResourceLoaderService } from './resource-loader'

export interface CreateServicesOptions {
    auth?: AuthService
    firebase: any
    storage: Storage
    sharedSyncLog: SharedSyncLog
    keychain: KeychainAPI
    errorTracker: ErrorTrackingService
    localStorage: LocalStorageService
    devicePlatform: MemexSyncDevicePlatform
    disableSyncEncryption?: boolean
    signalTransportFactory: SignalTransportFactory
    normalizeUrl: URLNormalizer
}

export async function createServices(
    options: CreateServicesOptions,
): Promise<Services> {
    const localStorage = options.localStorage
    const auth =
        (options.auth as MemexGoAuthService) ??
        new MemexGoAuthService(options.firebase)

    return {
        auth,
        localStorage,
        shareExt: new ShareExtService({ normalizeUrl: options.normalizeUrl }),
        backgroundProcess: new BackgroundProcessService({}),
        keychain: new KeychainService({ keychain: options.keychain }),
        errorTracker: options.errorTracker,
        readability: new ReadabilityService({}),
        resourceLoader: new ResourceLoaderService({}),
        sync: new SyncService({
            devicePlatform: options.devicePlatform,
            signalTransportFactory: options.signalTransportFactory,
            storageManager: options.storage.manager,
            clientSyncLog: options.storage.modules.clientSyncLog,
            syncInfoStorage: options.storage.modules.syncInfo,
            getSharedSyncLog: async () => options.sharedSyncLog,
            disableEncryption: options.disableSyncEncryption,
            errorTracker: options.errorTracker,
            localStorage,
            auth,
        }),
    }
}
