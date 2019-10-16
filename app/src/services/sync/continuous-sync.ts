import StorageManager from '@worldbrain/storex'
import { SharedSyncLog } from '@worldbrain/storex-sync/lib/shared-sync-log'
import { reconcileSyncLog } from '@worldbrain/storex-sync/lib/reconciliation'
import { doSync } from '@worldbrain/storex-sync'
import { ClientSyncLogStorage } from '@worldbrain/storex-sync/lib/client-sync-log'
import { AuthService } from '../auth/types'
import { SYNC_STORAGE_AREA_KEYS } from './constants'

export interface ContinuousSyncSettingsStore {
    retrieveSetting(
        key: keyof typeof SYNC_STORAGE_AREA_KEYS,
    ): Promise<ContinuousSyncSettingValue>
    storeSetting(
        key: keyof typeof SYNC_STORAGE_AREA_KEYS,
        value: ContinuousSyncSettingValue,
    ): Promise<void>
}
export type ContinuousSyncSettingValue = boolean | number | string | null

export default class ContinuousSync {
    public deviceId: number | string | null = null
    public enabled = false

    constructor(
        public options: {
            auth: AuthService
            storageManager: StorageManager
            clientSyncLog: ClientSyncLogStorage
            sharedSyncLog: SharedSyncLog
            settingStore: ContinuousSyncSettingsStore
            toggleSyncLogging: (enabled: boolean) => void
        },
    ) {}

    async setup() {
        const enabled = await this.options.settingStore.retrieveSetting(
            'continuousSyncEnabled',
        )
        if (!enabled) {
            return
        }

        this.deviceId = (await this.options.settingStore.retrieveSetting(
            'deviceId',
        )) as number | string | null
    }

    async initDevice() {
        const existingDeviceId = await this.options.settingStore.retrieveSetting(
            'deviceId',
        )
        if (existingDeviceId) {
            return
        }

        const user = await this.options.auth.getCurrentUser()
        if (!user) {
            throw new Error(
                'Tried to initialize sync device without authenticated user',
            )
        }

        const newDeviceId = await this.options.sharedSyncLog.createDeviceId({
            userId: user.id,
            sharedUntil: 1,
        })
        await this.options.settingStore.storeSetting('deviceId', newDeviceId)
        this.deviceId = newDeviceId
    }

    async enableContinuousSync() {
        await this.options.settingStore.storeSetting(
            'continuousSyncEnabled',
            true,
        )
        await this.setupContinuousSync()
    }

    async setupContinuousSync() {
        this.options.toggleSyncLogging(true)
        this.enabled = true
    }

    async forceIncrementalSync() {
        if (this.enabled) {
            await this.doIncrementalSync()
        }
    }

    private async doIncrementalSync() {
        const { auth } = this.options
        const user = await auth.getCurrentUser()
        if (!user) {
            throw new Error(`Cannot Sync without authenticated user`)
        }
        if (!this.deviceId) {
            throw new Error(`Cannot Sync without device ID`)
        }
        await doSync({
            clientSyncLog: this.options.clientSyncLog,
            sharedSyncLog: this.options.sharedSyncLog,
            storageManager: this.options.storageManager,
            reconciler: reconcileSyncLog,
            now: Date.now(),
            userId: user.id,
            deviceId: this.deviceId,
        })
    }
}
