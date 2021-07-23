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

export interface CreateServicesOptions {
    auth?: AuthService
    firebase?: any
    keychain: KeychainAPI
    errorTracker: ErrorTrackingService
    normalizeUrl: URLNormalizer
}

export async function createCoreServices(
    options: CreateServicesOptions,
): Promise<Omit<Services, 'sync' | 'localStorage'>> {
    const auth =
        (options.auth as MemexGoAuthService) ??
        new MemexGoAuthService(options.firebase)
    const pageFetcher = new PageFetcherService()

    return {
        auth,
        pageFetcher,
        shareExt: new ShareExtService({ normalizeUrl: options.normalizeUrl }),
        backgroundProcess: new BackgroundProcessService({}),
        keychain: new KeychainService({ keychain: options.keychain }),
        errorTracker: options.errorTracker,
        readability: new ReadabilityService({ pageFetcher }),
        resourceLoader: new ResourceLoaderService({}),
    }
}
