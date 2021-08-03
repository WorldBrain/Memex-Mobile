import SyncService from './sync'
import { MemexGoAuthService } from './auth'
import { KeychainService } from './keychain'
import { ShareExtService } from './share-ext'
import { ReadabilityService } from './readability'
import { StorageService } from './settings-storage'
import { ErrorTrackingService } from './error-tracking'
import { BackgroundProcessService } from './background-processing'
import { ResourceLoaderService } from './resource-loader'
import { PageFetcherService } from './page-fetcher'

export interface Services {
    auth: MemexGoAuthService
    sync: SyncService
    shareExt: ShareExtService
    keychain: KeychainService
    readability: ReadabilityService
    pageFetcher: PageFetcherService
    syncStorage: StorageService
    localStorage: StorageService
    errorTracker: ErrorTrackingService
    resourceLoader: ResourceLoaderService
    backgroundProcess: BackgroundProcessService
}

export type ServiceStarter = (args: { services: Services }) => Promise<void>
