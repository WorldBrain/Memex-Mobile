import type { URLNormalizer } from '@worldbrain/memex-url-utils'
import type { AuthService } from '@worldbrain/memex-common/lib/authentication/types'
import { storageKeys } from '../../app.json'

import type { Services } from './types'
import { ShareExtService } from './share-ext'
import type { ErrorTrackingService } from './error-tracking'

import { BackgroundProcessService } from './background-processing'
import { MemexGoAuthService } from './auth'
import { KeychainService } from './keychain'
import type { KeychainAPI } from './keychain/types'
import { ReadabilityService } from './readability'
import { ResourceLoaderService } from './resource-loader'
import { PageFetcherService } from './page-fetcher'
import { StorageService } from './settings-storage'
import { CloudSyncService } from './cloud-sync'
import { KeepAwakeService, KeepAwakeAPI } from './keep-awake'
import type { Storage } from 'src/storage/types'
import type { PersonalCloudBackend } from '@worldbrain/memex-common/lib/personal-cloud/backend/types'

export interface CreateServicesOptions {
    auth?: AuthService
    firebase?: any
    storage: Storage
    keychain: KeychainAPI
    keepAwakeLib?: KeepAwakeAPI
    errorTracker: ErrorTrackingService
    normalizeUrl: URLNormalizer
    personalCloudBackend: PersonalCloudBackend
}

export async function createServices(
    options: CreateServicesOptions,
): Promise<Services> {
    const auth =
        (options.auth as MemexGoAuthService) ??
        new MemexGoAuthService(options.firebase)
    const pageFetcher = new PageFetcherService()

    return {
        auth,
        pageFetcher,
        keepAwake: new KeepAwakeService({ keepAwakeLib: options.keepAwakeLib }),
        cloudSync: new CloudSyncService({
            backend: options.personalCloudBackend,
            storageManager: options.storage.manager,
            storage: options.storage.modules.personalCloud,
            errorTrackingService: options.errorTracker,
            setLastUpdateProcessedTime: (value) =>
                options.storage.modules.localSettings.setSetting({
                    key: storageKeys.lastSeenUpdateTime,
                    value,
                }),
        }),
        localStorage: new StorageService({
            settingsStorage: options.storage.modules.localSettings,
        }),
        syncStorage: new StorageService({
            settingsStorage: options.storage.modules.syncSettings,
        }),
        shareExt: new ShareExtService({ normalizeUrl: options.normalizeUrl }),
        backgroundProcess: new BackgroundProcessService({}),
        keychain: new KeychainService({ keychain: options.keychain }),
        errorTracker: options.errorTracker,
        readability: new ReadabilityService({ pageFetcher }),
        resourceLoader: new ResourceLoaderService({}),
    }
}
