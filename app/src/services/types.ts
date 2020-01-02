import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'

import SyncService from './sync'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'
import { BackgroundProcessService } from './background-processing'
import { KeychainService } from './keychain'

export interface Services {
    auth: AuthService
    sync: SyncService
    shareExt: ShareExtService
    keychain: KeychainService
    localStorage: LocalStorageService
    backgroundProcess: BackgroundProcessService
}
