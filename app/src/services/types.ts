import { AuthService } from './auth/types'
import { ShareExtService } from './share-ext'

export interface Services {
    auth: AuthService
    shareExt: ShareExtService
}
