import type { CloudSyncAPI } from './types'
import { PersonalCloudStorage } from 'src/features/personal-cloud/storage'

export interface Props {
    storage: PersonalCloudStorage
}

export class CloudSyncService implements CloudSyncAPI {
    constructor(private props: Props) {}

    runInitialSync: CloudSyncAPI['runInitialSync'] = async () => {
        const { storage } = this.props

        await storage.loadDeviceId()
        await storage.pullAllUpdates()
    }

    runContinuousSync: CloudSyncAPI['runContinuousSync'] = async () => {
        const { storage } = this.props
        if (storage.deviceId == null) {
            await storage.loadDeviceId()
        }

        await storage.pushAllQueuedUpdates()
        const { updatesIntegrated } = await storage.pullAllUpdates()
        return { totalChanges: updatesIntegrated }
    }
}
