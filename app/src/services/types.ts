import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'

import SyncService from './sync'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'
import { BackgroundProcessService } from './background-processing'

export interface Services {
    auth: AuthService
    sync: SyncService
    shareExt: ShareExtService
    localStorage: LocalStorageService
    backgroundProcess: BackgroundProcessService
}
