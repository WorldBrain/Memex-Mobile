import StorageManager from '@worldbrain/storex'
import { PersonalCloudStorage } from 'src/features/personal-cloud/storage'
import { dangerousPleaseBeSureDeleteAndRecreateDatabase } from 'src/storage/utils'
import type { CloudSyncAPI } from './types'

export interface Props {
    storage: PersonalCloudStorage
    storageManager: StorageManager
}

export class CloudSyncService implements CloudSyncAPI {
    constructor(private props: Props) {}

    ____wipeDBForSync: CloudSyncAPI['____wipeDBForSync'] = async () => {
        await dangerousPleaseBeSureDeleteAndRecreateDatabase(
            this.props.storageManager,
        )
    }

    sync: CloudSyncAPI['sync'] = async () => {
        const { storage } = this.props

        await storage.loadDeviceId()
        await storage.pushAllQueuedUpdates()
        const { updatesIntegrated } = await storage.integrateAllUpdates()
        return { totalChanges: updatesIntegrated }
    }
}
