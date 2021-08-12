import { URLNormalizer } from '@worldbrain/memex-url-utils'
import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'

import { Services } from './types'
import { ShareExtService } from './share-ext'
import { ErrorTrackingService } from './error-tracking'

import { BackgroundProcessService } from './background-processing'
import { MemexGoAuthService } from './auth'
import { KeychainService } from './keychain'
import { KeychainAPI } from './keychain/types'
import { ReadabilityService } from './readability'
import { ResourceLoaderService } from './resource-loader'
import { PageFetcherService } from './page-fetcher'
import { StorageService } from './settings-storage'
import { CloudSyncService } from './cloud-sync'
import { StorageModules } from 'src/storage/types'

export interface CreateServicesOptions {
    auth?: AuthService
    firebase?: any
    keychain: KeychainAPI
    errorTracker: ErrorTrackingService
    normalizeUrl: URLNormalizer
    storageModules: Pick<
        StorageModules,
        'localSettings' | 'syncSettings' | 'personalCloud'
    >
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
        cloudSync: new CloudSyncService({
            storage: options.storageModules.personalCloud,
        }),
        localStorage: new StorageService({
            settingsStorage: options.storageModules.localSettings,
        }),
        syncStorage: new StorageService({
            settingsStorage: options.storageModules.syncSettings,
        }),
        shareExt: new ShareExtService({ normalizeUrl: options.normalizeUrl }),
        backgroundProcess: new BackgroundProcessService({}),
        keychain: new KeychainService({ keychain: options.keychain }),
        errorTracker: options.errorTracker,
        readability: new ReadabilityService({ pageFetcher }),
        resourceLoader: new ResourceLoaderService({}),
    }
}
