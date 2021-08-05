import type { CloudSyncAPI } from './types'
import { PersonalCloudStorage } from 'src/features/personal-cloud/storage'

export interface Props {
    storage: PersonalCloudStorage
}

export class CloudSyncService implements CloudSyncAPI {
    constructor(private props: Props) {}

    runInitialSync: CloudSyncAPI['runInitialSync'] = async () => {
        await this.props.storage.loadDeviceId()
        console.log('INIT-SYNC: integrating updates')
        const {
            updatesIntegrated,
        } = await this.props.storage.integrateAllUpdates()
        console.log('INIT-SYNC: integrated updates:', updatesIntegrated)
    }

    runContinuousSync: CloudSyncAPI['runContinuousSync'] = async () => {
        if (this.props.storage.deviceId == null) {
            console.log('CONT-SYNC: device ID not setup')
            return { totalChanges: -1 }
        }

        console.log('CONT-SYNC: integrating updates')
        const {
            updatesIntegrated,
        } = await this.props.storage.integrateAllUpdates()
        console.log('CONT-SYNC: integrated updates:', updatesIntegrated)

        return { totalChanges: updatesIntegrated }
    }
}
