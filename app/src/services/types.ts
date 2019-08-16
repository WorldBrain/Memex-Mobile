import { AuthService } from './auth/types'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'

export interface Services {
    auth: AuthService
    shareExt: ShareExtService
    localStorage: LocalStorageService
}
