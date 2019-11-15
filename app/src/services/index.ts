import { SharedSyncLog } from '@worldbrain/storex-sync/lib/shared-sync-log'

import { Services } from './types'
import { ShareExtService } from './share-ext'
import { LocalStorageService } from './local-storage'
import SyncService from './sync'
import { SignalTransportFactory } from './sync/initial-sync'
import { Storage } from 'src/storage/types'
import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'

export interface CreateServicesOptions {
    storage: Storage
    signalTransportFactory: SignalTransportFactory
    sharedSyncLog: SharedSyncLog
    auth: AuthService
    localStorage: LocalStorageService
}

export async function createServices(
    options: CreateServicesOptions,
): Promise<Services> {
    const localStorage = options.localStorage
    const services = {
        auth: options.auth,
        shareExt: new ShareExtService({}),
        localStorage,
        sync: new SyncService({
            signalTransportFactory: options.signalTransportFactory,
            storageManager: options.storage.manager,
            clientSyncLog: options.storage.modules.clientSyncLog,
            sharedSyncLog: options.sharedSyncLog,
            auth: options.auth,
            localStorage,
        }),
    }
    return services
}
