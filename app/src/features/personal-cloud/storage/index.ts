import StorageManager from '@worldbrain/storex'
import {
    getObjectWhereByPk,
    getObjectByPk,
    updateOrCreate,
} from '@worldbrain/storex/lib/utils'
import ActionQueue from '@worldbrain/memex-common/lib/action-queue'
import { StorageOperationEvent } from '@worldbrain/storex-middleware-change-watcher/lib/types'
import { ActionExecutor } from '@worldbrain/memex-common/lib/action-queue/types'
import { preprocessPulledObject } from '@worldbrain/memex-common/lib/personal-cloud/utils'
import { AsyncMutex } from '@worldbrain/memex-common/lib/utils/async-mutex'
import { STORAGE_VERSIONS } from '@worldbrain/memex-common/lib/browser-extension/storage/versions'
import {
    PersonalCloudUpdateType,
    PersonalCloudUpdateBatch,
    PersonalCloudUpdatePushBatch,
} from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import { getCurrentSchemaVersion } from '@worldbrain/memex-common/lib/storage/utils'

import {
    PersonalCloudAction,
    PersonalCloudActionType,
    UpdateIntegrationResult,
} from './types'
import { PERSONAL_CLOUD_ACTION_RETRY_INTERVAL } from './constants'
import type { AuthenticatedUser } from '@worldbrain/memex-common/lib/authentication/types'

export interface Dependencies {
    storageManager: StorageManager
    uploadClientUpdates: (
        updates: PersonalCloudUpdatePushBatch,
    ) => Promise<void>
    getUserId(): Promise<string | number | null>
    userIdChanges(): AsyncIterableIterator<AuthenticatedUser | null>
    createDeviceId(userId: number | string): Promise<string | number>
    getDeviceId(): Promise<string | number>
    setDeviceId(deviceId: string | number): Promise<void>
}

export class PersonalCloudStorage {
    actionQueue: ActionQueue<PersonalCloudAction>
    private currentSchemaVersion?: Date
    private pushMutex = new AsyncMutex()
    private pullMutex = new AsyncMutex()
    private deviceId?: string | number

    constructor(private dependencies: Dependencies) {
        this.actionQueue = new ActionQueue({
            storageManager: dependencies.storageManager,
            collectionName: 'personalCloudAction',
            versions: { initial: STORAGE_VERSIONS[25].version },
            retryIntervalInMs: PERSONAL_CLOUD_ACTION_RETRY_INTERVAL,
            executeAction: this.executeAction,
        })
    }

    async setup() {
        this.currentSchemaVersion = getCurrentSchemaVersion(
            this.dependencies.storageManager,
        )
        await this.actionQueue.setup({ paused: true })
        await this.loadDeviceId()
    }

    async loadDeviceId() {
        const userId = await this.dependencies.getUserId()
        if (userId) {
            this.deviceId = await this.dependencies.getDeviceId()
            if (!this.deviceId) {
                this.deviceId = await this.dependencies.createDeviceId(userId)
                await this.dependencies.setDeviceId(this.deviceId!)
            }
            this.actionQueue.unpause()
        } else {
            this.actionQueue.pause()
            delete this.deviceId
        }
    }

    async pushAllQueuedUpdates(): Promise<void> {
        await this.actionQueue.executePendingActions()
    }

    async integrateUpdates(
        updates: PersonalCloudUpdateBatch,
    ): Promise<UpdateIntegrationResult> {
        const { releaseMutex } = await this.pullMutex.lock()
        const { storageManager } = this.dependencies
        let updatesIntegrated = 0

        try {
            for (const update of updates) {
                if (update.type === PersonalCloudUpdateType.Overwrite) {
                    const object = update.object
                    preprocessPulledObject({
                        storageRegistry: storageManager.registry,
                        collection: update.collection,
                        object,
                    })

                    // TODO: maybe add mobile app support for media fields
                    // if (update.media) {
                    //     await Promise.all(
                    //         Object.entries(update.media).map(
                    //             async ([key, path]) => {
                    //                 object[
                    //                     key
                    //                 ] = await this.dependencies.backend.downloadFromMedia(
                    //                     { path: path.path },
                    //                 )
                    //             },
                    //         ),
                    //     )
                    // }

                    // WARNING: Keep in mind this skips all storage middleware
                    await updateOrCreate({
                        storageManager,
                        collection: update.collection,
                        updates: update.object,
                        where: update.where,
                        executeOperation: (...args) =>
                            storageManager.backend.operation(...args),
                    })

                    updatesIntegrated++
                } else if (update.type === PersonalCloudUpdateType.Delete) {
                    await storageManager.backend.operation(
                        'deleteObjects',
                        update.collection,
                        update.where,
                    )
                    updatesIntegrated++
                }
            }
        } finally {
            releaseMutex()
        }

        return { updatesIntegrated }
    }

    private executeAction: ActionExecutor<PersonalCloudAction> = async ({
        action,
    }) => {
        if (!this.deviceId) {
            return { pauseAndRetry: true }
        }

        if (action.type === PersonalCloudActionType.PushObject) {
            await this.dependencies.uploadClientUpdates(
                action.updates.map((update) => ({
                    ...update,
                    deviceId: update.deviceId ?? this.deviceId,
                })),
            )
        }
    }

    async handlePostStorageChange(event: StorageOperationEvent<'post'>) {
        if (!this.deviceId) {
            return
        }

        const { releaseMutex } = await this.pushMutex.lock()

        try {
            for (const change of event.info.changes) {
                if (change.type === 'create') {
                    const object = await getObjectByPk(
                        this.dependencies.storageManager,
                        change.collection,
                        change.pk,
                    )
                    if (!object) {
                        // Here we assume the object is already deleted again before
                        // we got the change to look at it, so just ignore the create
                        continue
                    }
                    await this.actionQueue.scheduleAction(
                        {
                            type: PersonalCloudActionType.PushObject,
                            updates: [
                                {
                                    type: PersonalCloudUpdateType.Overwrite,
                                    schemaVersion: this.currentSchemaVersion!,
                                    deviceId: this.deviceId!,
                                    collection: change.collection,
                                    object,
                                },
                            ],
                        },
                        { queueInteraction: 'queue-and-return' },
                    )
                } else if (change.type === 'modify') {
                    const objects = await Promise.all(
                        change.pks.map((pk) =>
                            getObjectByPk(
                                this.dependencies.storageManager,
                                change.collection,
                                pk,
                            ),
                        ),
                    )
                    await this.actionQueue.scheduleAction(
                        {
                            type: PersonalCloudActionType.PushObject,
                            updates: objects
                                .filter((object) => !!object)
                                .map((object) => ({
                                    type: PersonalCloudUpdateType.Overwrite,
                                    schemaVersion: this.currentSchemaVersion!,
                                    deviceId: this.deviceId!,
                                    collection: change.collection,
                                    object,
                                })),
                        },
                        { queueInteraction: 'queue-and-return' },
                    )
                } else if (change.type === 'delete') {
                    const wheres = await Promise.all(
                        change.pks.map((pk) =>
                            getObjectWhereByPk(
                                this.dependencies.storageManager.registry,
                                change.collection,
                                pk,
                            ),
                        ),
                    )
                    await this.actionQueue.scheduleAction(
                        {
                            type: PersonalCloudActionType.PushObject,
                            updates: wheres.map((where) => ({
                                type: PersonalCloudUpdateType.Delete,
                                schemaVersion: this.currentSchemaVersion!,
                                deviceId: this.deviceId!,
                                collection: change.collection,
                                where,
                            })),
                        },
                        { queueInteraction: 'queue-and-return' },
                    )
                }
            }
        } finally {
            releaseMutex()
        }
    }
}
