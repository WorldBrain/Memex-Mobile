import type { CloudSyncAPI } from './types'
import { PersonalCloudStorage } from 'src/features/personal-cloud/storage'

export interface Props {
    storage: PersonalCloudStorage
}

export class CloudSyncService implements CloudSyncAPI {
    constructor(private props: Props) {}

    private isStorageSetup(): boolean {
        return this.props.storage.deviceId != null
    }

    runInitialSync: CloudSyncAPI['runInitialSync'] = async () => {
        if (!this.isStorageSetup()) {
            return
        }

        console.log('performing initial sync...')
        // TODO: insert init sync here
        await new Promise((resolve, reject) => setTimeout(resolve, 1000))
    }

    runContinuousSync: CloudSyncAPI['runContinuousSync'] = async () => {
        if (!this.isStorageSetup()) {
            return
        }

        await this.props.storage.integrateAllUpdates()
    }
}
