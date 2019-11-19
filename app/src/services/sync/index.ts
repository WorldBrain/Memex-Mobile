import StorageManager from '@worldbrain/storex'
const WebRTC = require('react-native-webrtc')

import { SharedSyncLog } from '@worldbrain/storex-sync/lib/shared-sync-log'
import { SyncSettingsStore } from '@worldbrain/storex-sync/lib/integration/settings'
import SyncService, {
    SignalTransportFactory,
} from '@worldbrain/memex-common/lib/sync'
import { MemexSyncSetting } from '@worldbrain/memex-common/lib/sync/types'

import '../../polyfills'
import { AuthService } from '@worldbrain/memex-common/lib/authentication/types'
import { LocalStorageService } from '../local-storage'
import { MemexClientSyncLogStorage } from 'src/features/sync/storage'
import { PRODUCT_VERSION } from 'src/constants'

export default class AppSyncService extends SyncService {
    constructor(options: {
        auth: AuthService
        storageManager: StorageManager
        signalTransportFactory: SignalTransportFactory
        localStorage: LocalStorageService
        clientSyncLog: MemexClientSyncLogStorage
        getSharedSyncLog: () => Promise<SharedSyncLog>
    }) {
        super({
            ...options,
            settingStore: new MemexSyncSettingStore(options),
            productType: 'app',
            productVersion: PRODUCT_VERSION,
        })

        this.initialSync.wrtc = WebRTC
    }
}

class MemexSyncSettingStore implements SyncSettingsStore {
    constructor(private options: { localStorage: LocalStorageService }) {}

    async retrieveSetting(key: MemexSyncSetting) {
        return this.options.localStorage.get(key)
    }
    async storeSetting(
        key: MemexSyncSetting,
        value: boolean | number | string | null,
    ) {
        await this.options.localStorage.set(key, value)
    }
}
