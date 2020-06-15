import SyncService from './sync'
import { MemexGoAuthService } from './auth'
import { KeychainService } from './keychain'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'
import { ErrorTrackingService } from './error-tracking'
import { BackgroundProcessService } from './background-processing'

export interface Services {
    auth: MemexGoAuthService
    sync: SyncService
    shareExt: ShareExtService
    keychain: KeychainService
    localStorage: LocalStorageService
    errorTracker: ErrorTrackingService
    backgroundProcess: BackgroundProcessService
}

export type ServiceStarter = (args: { services: Services }) => Promise<void>
