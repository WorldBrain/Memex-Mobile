import StorageManager from '@worldbrain/storex'
import {
    getObjectWhereByPk,
    getObjectByPk,
    updateOrCreate,
} from '@worldbrain/storex/lib/utils'
import ActionQueue from '@worldbrain/memex-common/lib/action-queue'
import { COLLECTION_NAMES as PAGES_COLLECTION_NAMES } from '@worldbrain/memex-common/lib/storage/modules/pages/constants'
import { StorageOperationEvent } from '@worldbrain/storex-middleware-change-watcher/lib/types'
import { ActionExecutor } from '@worldbrain/memex-common/lib/action-queue/types'
import { preprocessPulledObject } from '@worldbrain/memex-common/lib/personal-cloud/utils'
import { AsyncMutex } from '@worldbrain/memex-common/lib/utils/async-mutex'
import { STORAGE_VERSIONS } from '@worldbrain/memex-common/lib/browser-extension/storage/versions'
import {
    PersonalCloudUpdateType,
    PersonalCloudUpdateBatch,
    PersonalCloudUpdatePushBatch,
    PersonalCloudDeviceId,
    PersonalCloudListTreeMoveUpdate,
    PersonalCloudListTreeDeleteUpdate,
} from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import { getCurrentSchemaVersion } from '@worldbrain/memex-common/lib/storage/utils'

import {
    PersonalCloudAction,
    PersonalCloudActionType,
    UpdateIntegrationResult,
} from './types'
import {
    PERSONAL_CLOUD_ACTION_RETRY_INTERVAL,
    CLOUD_SYNCED_COLLECTIONS,
} from './constants'
import { PAGE_FETCH_DATA_FLAG } from '@worldbrain/memex-common/lib/page-indexing/constants'
import { LIST_TREE_OPERATION_ALIASES } from '@worldbrain/memex-common/lib/content-sharing/storage/list-tree-middleware'
import { COLLECTION_NAMES as LIST_COLL_NAMES } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'

const BAD_ID_COLLECTION_NAMES = [
    PAGES_COLLECTION_NAMES.pageMetadata,
    PAGES_COLLECTION_NAMES.pageEntity,
]

export interface Dependencies {
    storageManager: StorageManager
    uploadClientUpdates: (
        updates: PersonalCloudUpdatePushBatch,
    ) => Promise<void>
    getUserId(): Promise<string | number | null>
    createDeviceId(userId: number | string): Promise<string | number>
    getDeviceId(): Promise<PersonalCloudDeviceId | null>
    setDeviceId(deviceId: PersonalCloudDeviceId): Promise<void>
}

export class PersonalCloudStorage {
    actionQueue: ActionQueue<PersonalCloudAction>
    private currentSchemaVersion?: Date
    private pushMutex = new AsyncMutex()
    private pullMutex = new AsyncMutex()
    private deviceId: PersonalCloudDeviceId | null = null

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
            if (this.deviceId == null) {
                this.deviceId = await this.dependencies.createDeviceId(userId)
                await this.dependencies.setDeviceId(this.deviceId!)
            }
            this.actionQueue.unpause()
        } else {
            this.actionQueue.pause()
            this.deviceId = null
        }
    }

    async loadUserId() {
        return (await this.dependencies.getUserId()) ?? null
    }

    async pushAllQueuedUpdates(): Promise<void> {
        await this.actionQueue.executePendingActions()
    }

    async integrateUpdates(
        updates: PersonalCloudUpdateBatch,
        opts?: { continueOnError?: boolean },
    ): Promise<UpdateIntegrationResult> {
        const { releaseMutex } = await this.pullMutex.lock()
        const { storageManager } = this.dependencies
        let updatesIntegrated = 0

        const doesListExist = async (id: number): Promise<boolean> => {
            const existing = await storageManager
                .collection('customLists')
                .findOneObject({ id })
            return !!existing
        }

        try {
            for (const update of updates) {
                try {
                    if (
                        update.type === PersonalCloudUpdateType.ListTreeDelete
                    ) {
                        // Skip op if lists don't exist (most likely been deleted)
                        if (
                            !(await doesListExist(update.rootNodeLocalListId))
                        ) {
                            continue
                        }

                        await storageManager.operation(
                            LIST_TREE_OPERATION_ALIASES.deleteTree,
                            LIST_COLL_NAMES.listTrees,
                            {
                                localListId: update.rootNodeLocalListId,
                            },
                            { skipSync: true },
                        )
                    } else if (
                        update.type === PersonalCloudUpdateType.ListTreeMove
                    ) {
                        // Skip op if lists don't exist (most likely been deleted)
                        if (
                            !(await doesListExist(
                                update.rootNodeLocalListId,
                            )) ||
                            !(update.parentLocalListId != null
                                ? await doesListExist(update.parentLocalListId)
                                : true)
                        ) {
                            continue
                        }

                        await storageManager.operation(
                            LIST_TREE_OPERATION_ALIASES.moveTree,
                            LIST_COLL_NAMES.listTrees,
                            {
                                localListId: update.rootNodeLocalListId,
                                newParentListId: update.parentLocalListId,
                            },
                            { skipSync: true },
                        )
                    } else if (
                        !CLOUD_SYNCED_COLLECTIONS.includes(update.collection)
                    ) {
                        continue
                    } else if (
                        update.type === PersonalCloudUpdateType.Overwrite
                    ) {
                        if (update.media) {
                            // We currently don't support media updates on mobile
                            continue
                        }

                        const object = update.object
                        preprocessPulledObject({
                            storageRegistry: storageManager.registry,
                            collection: update.collection,
                            object,
                        })

                        // WARNING: Keep in mind this skips all storage middleware
                        await updateOrCreate({
                            storageManager,
                            collection: update.collection,
                            updates: update.object,
                            where: update.where,
                            executeOperation: (...args) =>
                                storageManager.backend.operation(...args),
                        })
                    } else if (update.type === PersonalCloudUpdateType.Delete) {
                        await storageManager.backend.operation(
                            'deleteObjects',
                            update.collection,
                            update.where,
                        )
                    }
                    updatesIntegrated++
                } catch (err) {
                    // These collections have dynamically generated IDs on the client-side when sync DL'd,
                    //  thus they can't be easily deduped against existing data by the main sync's `updateOrCreate` queries.
                    //  Instead they error out upon insertion as they have conflicting unique FKs, which
                    //  we don't want blocking future updates.
                    // TODO: Make sync more robust to handle collections like this.
                    const isBadIdCollection =
                        (update.type === PersonalCloudUpdateType.Delete ||
                            update.type ===
                                PersonalCloudUpdateType.Overwrite) &&
                        BAD_ID_COLLECTION_NAMES.includes(update.collection)

                    const isDeleteForNonExistingData =
                        update.type === PersonalCloudUpdateType.Delete &&
                        err.message.includes('FOREIGN KEY constraint')

                    if (
                        !opts?.continueOnError &&
                        !isBadIdCollection &&
                        !isDeleteForNonExistingData
                    ) {
                        throw err
                    }
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

    async handleListTreeStorageChange(
        update:
            | PersonalCloudListTreeMoveUpdate
            | PersonalCloudListTreeDeleteUpdate,
    ) {
        await this.actionQueue.scheduleAction(
            {
                type: PersonalCloudActionType.PushObject,
                updates: [
                    {
                        ...update,
                        deviceId: this.deviceId!,
                        schemaVersion: this.currentSchemaVersion!,
                    },
                ],
            },
            { queueInteraction: 'queue-and-return' },
        )
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
                    // Set up created pages to have their text fetched on the cloud translation layer
                    if (change.collection === PAGES_COLLECTION_NAMES.page) {
                        object.text = PAGE_FETCH_DATA_FLAG
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
