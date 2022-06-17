import type StorageManager from '@worldbrain/storex'
import { dangerousPleaseBeSureDeleteAndRecreateDatabase } from 'src/storage/utils'
import { CLOUD_SYNCED_COLLECTIONS } from 'src/features/personal-cloud/storage/constants'
import type { PersonalCloudStorage } from 'src/features/personal-cloud/storage'
import type { PersonalCloudBackend } from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import type { CloudSyncAPI } from './types'
import type { ErrorTrackingService } from '../error-tracking'

export interface Props {
    backend: PersonalCloudBackend
    storage: PersonalCloudStorage
    storageManager: StorageManager
    errorTrackingService: ErrorTrackingService
    setLastUpdateProcessedTime(time: number): Promise<void>
}

export class CloudSyncService implements CloudSyncAPI {
    /**
     * Each of these booleans correspond to an invocation of `syncStream` method. To allow each
     * invocation to be interrupted, without affecting other invocations that might overlap their runtimes.
     * */
    private shouldInterruptStream: boolean[] = []
    private streamInvocations: number = 0

    constructor(private props: Props) {}

    ____wipeDBForSync: CloudSyncAPI['____wipeDBForSync'] = async () => {
        await dangerousPleaseBeSureDeleteAndRecreateDatabase(
            this.props.storageManager,
        )
    }

    sync: CloudSyncAPI['sync'] = async () => {
        const { storage, backend, setLastUpdateProcessedTime } = this.props

        await storage.loadDeviceId()
        await storage.pushAllQueuedUpdates()

        let { batch: updateBatch, lastSeen } =
            await backend.bulkDownloadUpdates()

        updateBatch = updateBatch.filter((update) =>
            CLOUD_SYNCED_COLLECTIONS.includes(update.collection),
        )
        const { updatesIntegrated } = await storage.integrateUpdates(
            updateBatch,
        )
        await setLastUpdateProcessedTime(lastSeen)
        return { totalChanges: updatesIntegrated }
    }

    syncStream: CloudSyncAPI['syncStream'] = async () => {
        const {
            storage,
            backend,
            errorTrackingService,
            setLastUpdateProcessedTime,
        } = this.props

        this.streamInvocations += 1
        const currentInvocation = this.streamInvocations

        await storage.loadDeviceId()
        await storage.pushAllQueuedUpdates()

        try {
            for await (const { batch, lastSeen } of backend.streamUpdates({
                skipUserChangeListening: true,
            })) {
                try {
                    if (this.shouldInterruptStream[currentInvocation]) {
                        break
                    }

                    await storage.integrateUpdates(batch)
                    await setLastUpdateProcessedTime(lastSeen)

                    if (this.shouldInterruptStream[currentInvocation]) {
                        break
                    }
                } catch (err) {
                    errorTrackingService.track(err)
                }
            }
        } catch (err) {
            errorTrackingService.track(err)
            throw err
        }
    }

    endSyncStream: CloudSyncAPI['endSyncStream'] = async () => {
        this.shouldInterruptStream[this.streamInvocations] = true
    }
}
