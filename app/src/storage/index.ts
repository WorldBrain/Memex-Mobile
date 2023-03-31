import { ConnectionOptions } from 'typeorm'
import type { ReactNativeFirebase } from '@react-native-firebase/app'
import StorageManager from '@worldbrain/storex'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'
import {
    registerModuleMapCollections,
    _defaultOperationExecutor,
} from '@worldbrain/storex-pattern-modules'
import { ChangeWatchMiddleware } from '@worldbrain/storex-middleware-change-watcher'
import { extractUrlParts, normalizeUrl } from '@worldbrain/memex-url-utils'
import { createStorexPlugins } from '@worldbrain/memex-common/lib/storage/modules/mobile-app/plugins'
import UserStorage from '@worldbrain/memex-common/lib/user-management/storage'
import { OverviewStorage } from '@worldbrain/memex-common/lib/storage/modules/mobile-app/features/overview/storage'
import { FollowedListStorage } from 'src/features/followed-lists/storage'
import { MetaPickerStorage } from 'src/features/meta-picker/storage'
import { PageEditorStorage } from 'src/features/page-editor/storage'
import { ContentSharingClientStorage } from '@worldbrain/memex-common/lib/content-sharing/client-storage'
import PersonalCloudServerStorage from '@worldbrain/memex-common/lib/personal-cloud/storage'
import { storageKeys } from '../../app.json'

import defaultConnectionOpts from './default-connection-opts'
import type { Storage, ServerStorage } from './types'
import { SettingsStorage } from 'src/features/settings/storage'
import { ReaderStorage } from 'src/features/reader/storage'
import {
    createServerStorageManager,
    createMemoryServerStorageManager,
} from './server'
import {
    MemexClientSyncLogStorage,
    MemexSyncInfoStorage,
} from 'src/features/sync/storage'
import { StorageOperationEvent } from '@worldbrain/storex-middleware-change-watcher/lib/types'
import { DexieStorageBackend } from '@worldbrain/storex-backend-dexie'
import inMemory from '@worldbrain/storex-backend-dexie/lib/in-memory'
import extractTerms from '@worldbrain/memex-stemmer'
import { PersonalCloudStorage } from 'src/features/personal-cloud/storage'
import { CopyPasterStorage } from 'src/features/copy-paster/storage'
import { CLOUD_SYNCED_COLLECTIONS } from 'src/features/personal-cloud/storage/constants'
import type {
    PersonalCloudDeviceId,
    PersonalCloudUpdatePushBatch,
} from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import type { AuthService } from '@worldbrain/memex-common/lib/authentication/types'
import ContentSharingStorage from '@worldbrain/memex-common/lib/content-sharing/storage'
import ContentConversationStorage from '@worldbrain/memex-common/lib/content-conversations/storage'
import { SPECIAL_LIST_IDS } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import ActivityStreamsStorage from '@worldbrain/memex-common/lib/activity-streams/storage'

export interface CreateStorageOptions {
    authService: AuthService
    typeORMConnectionOpts?: ConnectionOptions
    uploadClientUpdates: (
        updates: PersonalCloudUpdatePushBatch,
    ) => Promise<void>
    createDeviceId: (userId: string | number) => Promise<string | number>
}

const filterOutSpecialListId = (id: number) =>
    id !== SPECIAL_LIST_IDS.INBOX && id !== SPECIAL_LIST_IDS.MOBILE

export async function createStorage({
    authService,
    createDeviceId,
    uploadClientUpdates,
    typeORMConnectionOpts,
}: CreateStorageOptions): Promise<Storage> {
    const backend = typeORMConnectionOpts
        ? new TypeORMStorageBackend({
              connectionOptions: {
                  ...defaultConnectionOpts,
                  ...typeORMConnectionOpts,
              } as ConnectionOptions,
              legacyMemexCompatibility: true,
          })
        : new DexieStorageBackend({
              idbImplementation: inMemory(),
              dbName: 'unittest',
              stemmer: extractTerms,
          })

    for (const plugin of createStorexPlugins()) {
        backend.use(plugin)
    }

    const storageManager = new StorageManager({ backend })
    const syncSettings = new SettingsStorage({
        storageManager,
        collectionName: SettingsStorage.SYNC_SETTINGS_COLL_NAME,
        collectionVersion: new Date('2019-12-16'),
    })
    const localSettings = new SettingsStorage({
        storageManager,
        collectionName: SettingsStorage.LOCAL_SETTINGS_COLL_NAME,
        collectionVersion: new Date('2021-08-03'),
    })
    const contentSharing = new ContentSharingClientStorage({ storageManager })

    const modules: Storage['modules'] = {
        syncSettings,
        localSettings,
        contentSharing,
        overview: new OverviewStorage({
            storageManager,
            normalizeUrl,
            extractUrlParts,
        }),
        followedLists: new FollowedListStorage({
            storageManager,
        }),
        metaPicker: new MetaPickerStorage({
            storageManager,
            normalizeUrl,
            getSpaceRemoteIds: (localIds) =>
                contentSharing.getRemoteListIds({ localIds }),
            getSpaceSuggestionsCache: async () => {
                const spaceIds = await localSettings.getSetting<number[]>({
                    key: storageKeys.spaceSuggestionsCache,
                })
                return spaceIds?.filter(filterOutSpecialListId) ?? []
            },
            setSpaceSuggestionsCache: async (spaceIds) => {
                await localSettings.setSetting({
                    key: storageKeys.spaceSuggestionsCache,
                    value: spaceIds.filter(filterOutSpecialListId),
                })
            },
        }),
        copyPaster: new CopyPasterStorage({ storageManager }),
        clientSyncLog: new MemexClientSyncLogStorage({ storageManager }),
        syncInfo: new MemexSyncInfoStorage({ storageManager }),
        reader: new ReaderStorage({ storageManager, normalizeUrl }),
        pageEditor: new PageEditorStorage({
            storageManager,
            normalizeUrl,
            createDefaultAnnotPrivacyLevel: (annotation) =>
                contentSharing.setAnnotationPrivacyLevel({
                    annotation,
                    privacyLevel: AnnotationPrivacyLevels.PRIVATE,
                }),
            deleteAnnotPrivacyLevel: (annotation) =>
                contentSharing.deleteAnnotationPrivacyLevel({
                    annotation,
                }),
            findAnnotPrivacyLevels: (annotations) =>
                contentSharing.getPrivacyLevelsByAnnotation({ annotations }),
        }),
        personalCloud: new PersonalCloudStorage({
            uploadClientUpdates,
            storageManager,
            createDeviceId,
            getDeviceId: () =>
                localSettings.getSetting<PersonalCloudDeviceId>({
                    key: storageKeys.deviceId,
                }),
            setDeviceId: async (value) =>
                localSettings.setSetting({ key: storageKeys.deviceId, value }),
            getUserId: async () =>
                (await authService.getCurrentUser())?.id ?? null,
        }),
    }

    registerModuleMapCollections(storageManager.registry, {
        syncSettings: modules.syncSettings,
        localSettings: modules.localSettings,
        overview: modules.overview,
        metaPicker: modules.metaPicker,
        pageEditor: modules.pageEditor,
        clientSyncLog: modules.clientSyncLog,
        followedLists: modules.followedLists,
        syncInfo: modules.syncInfo,
        reader: modules.reader,
        contentSharing: modules.contentSharing,
        personalCloudAction: modules.personalCloud.actionQueue.storage,
        copyPaster: modules.copyPaster,
    })

    await storageManager.finishInitialization()
    await storageManager.backend.migrate()

    return {
        manager: storageManager,
        modules,
    }
}

export async function setStorageMiddleware(options: {
    storage: Storage
    extraPostChangeWatcher?: (
        context: StorageOperationEvent<'post'>,
    ) => void | Promise<void>
}) {
    const watchedCollections = new Set(CLOUD_SYNCED_COLLECTIONS)

    options.storage.manager.setMiddleware([
        new ChangeWatchMiddleware({
            storageManager: options.storage.manager,
            shouldWatchCollection: (collection) =>
                watchedCollections.has(collection),
            postprocessOperation: async (event) => {
                await Promise.all([
                    options.storage.modules.personalCloud.handlePostStorageChange(
                        event,
                    ),
                    options.extraPostChangeWatcher?.(event),
                ])
            },
        }),
    ])
}

export async function createServerStorage(
    firebase?: ReactNativeFirebase.Module,
): Promise<ServerStorage> {
    let manager: StorageManager

    if (firebase != null) {
        manager = createServerStorageManager(firebase)
        // } else if (backendType === 'firebase-emulator') {
        //     const firebaseTesting = require('@firebase/testing')
        //     const projectId = Date.now().toString()
        //     const firebaseApp = firebaseTesting.initializeTestApp({ projectId })

        //     if (process.env['DISABLE_FIRESTORE_RULES'] === 'true') {
        //         await firebaseTesting.loadFirestoreRules({
        //             projectId,
        //             rules: `
        //             service cloud.firestore {
        //                 match /databases/{database}/documents {
        //                     match /{document=**} {
        //                         allow read, write: if true;
        //                     }
        //                 }
        //             }
        //             `,
        //         })
        //     }

        //     manager = createServerStorageManager(firebaseApp, firebaseTesting)
    } else {
        manager = createMemoryServerStorageManager()
    }

    const operationExecuter = (storageModuleName: string) =>
        _defaultOperationExecutor(manager)
    const userManagement = new UserStorage({
        storageManager: manager,
        operationExecuter: operationExecuter('users'),
    })
    const personalCloud = new PersonalCloudServerStorage({
        storageManager: manager,
        autoPkType: 'string',
    })
    const contentSharing = new ContentSharingStorage({
        operationExecuter: operationExecuter('contentSharing'),
        storageManager: manager,
        autoPkType: 'string',
    })
    const contentConversations = new ContentConversationStorage({
        operationExecuter: operationExecuter('contentConversations'),
        storageManager: manager,
        autoPkType: 'string',
        contentSharing,
    })
    const activityStreams = new ActivityStreamsStorage({
        storageManager: manager,
    })

    const serverStorage = {
        manager,
        modules: {
            personalCloud,
            userManagement,
            contentSharing,
            activityStreams,
            contentConversations,
        },
    }

    registerModuleMapCollections(manager.registry, serverStorage.modules)
    await manager.finishInitialization()

    return serverStorage
}
