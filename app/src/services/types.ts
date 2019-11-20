import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'

import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'
import SyncService from './sync'

export interface Services {
    auth: AuthService
    shareExt: ShareExtService
    localStorage: LocalStorageService
    sync: SyncService
}
