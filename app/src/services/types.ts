import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'

import SyncService from './sync'
import { KeychainService } from './keychain'
import { ShareExtService } from './share-ext'
import { ReadabilityService } from './readability'
import { LocalStorageService } from './local-storage'
import { ErrorTrackingService } from './error-tracking'
import { BackgroundProcessService } from './background-processing'
import { ResourceLoaderService } from './resource-loader'

export interface Services {
    auth: AuthService
    sync: SyncService
    shareExt: ShareExtService
    keychain: KeychainService
    readability: ReadabilityService
    localStorage: LocalStorageService
    errorTracker: ErrorTrackingService
    resourceLoader: ResourceLoaderService
    backgroundProcess: BackgroundProcessService
}

export type ServiceStarter = (args: { services: Services }) => Promise<void>
