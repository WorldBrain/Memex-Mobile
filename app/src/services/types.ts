import type { CloudSyncAPI } from './cloud-sync/types'
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
    cloudSync: CloudSyncAPI
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

export type ServiceStarter<ServiceNames extends keyof Services> = (args: {
    services: Pick<Services, ServiceNames>
}) => Promise<void>
