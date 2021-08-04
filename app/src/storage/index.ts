import { ConnectionOptions } from 'typeorm'
import StorageManager from '@worldbrain/storex'
import { updateOrCreate } from '@worldbrain/storex/lib/utils'
import { TypeORMStorageBackend } from '@worldbrain/storex-backend-typeorm'
import {
    registerModuleMapCollections,
    _defaultOperationExecutor,
} from '@worldbrain/storex-pattern-modules'
import { ChangeWatchMiddleware } from '@worldbrain/storex-middleware-change-watcher'
import { extractUrlParts, normalizeUrl } from '@worldbrain/memex-url-utils'
import { createStorexPlugins } from '@worldbrain/memex-storage/lib/mobile-app/plugins'
import UserStorage from '@worldbrain/memex-common/lib/user-management/storage'
import { OverviewStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/overview/storage'
import { MetaPickerStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/storage'
import { PageEditorStorage } from '@worldbrain/memex-storage/lib/mobile-app/features/page-editor/storage'
import { ContentSharingClientStorage } from '@worldbrain/memex-common/lib/content-sharing/client-storage'
import PersonalCloudServerStorage from '@worldbrain/memex-common/lib/personal-cloud/storage'
import { storageKeys } from '../../app.json'

import defaultConnectionOpts from './default-connection-opts'
import { Storage } from './types'
import { SettingsStorage } from 'src/features/settings/storage'
import { ReaderStorage } from 'src/features/reader/storage'
import { createServerStorageManager } from './server'
import { createSharedSyncLog } from 'src/services/sync/shared-sync-log'
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
import { authChanges } from '@worldbrain/memex-common/lib/authentication/utils'
import { FirestoreStorageBackend } from '@worldbrain/storex-backend-firestore'
import type {
    PersonalCloudBackend,
    PersonalCloudDeviceId,
} from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import type { AuthService } from '@worldbrain/memex-common/lib/authentication/types'

export interface CreateStorageOptions {
    authService: AuthService
    typeORMConnectionOpts?: ConnectionOptions
    createDeviceId: (userId: string | number) => Promise<string | number>
    createPersonalCloudBackend: (
        storageManager: StorageManager,
        modules: Pick<Storage['modules'], 'localSettings'>,
        getDeviceId: () => Promise<PersonalCloudDeviceId>,
    ) => PersonalCloudBackend
}

export async function createStorage({
    authService,
    createDeviceId,
    typeORMConnectionOpts,
    createPersonalCloudBackend,
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

    const getDeviceId = async () =>
        localSettings.getSetting({ key: storageKeys.deviceId })

    const modules: Storage['modules'] = {
        syncSettings,
        localSettings,
        overview: new OverviewStorage({
            storageManager,
            normalizeUrl,
            extractUrlParts,
        }),
        metaPicker: new MetaPickerStorage({ storageManager, normalizeUrl }),
        pageEditor: new PageEditorStorage({ storageManager, normalizeUrl }),
        copyPaster: new CopyPasterStorage({ storageManager }),
        clientSyncLog: new MemexClientSyncLogStorage({ storageManager }),
        syncInfo: new MemexSyncInfoStorage({ storageManager }),
        reader: new ReaderStorage({ storageManager, normalizeUrl }),
        contentSharing: new ContentSharingClientStorage({ storageManager }),
        personalCloud: new PersonalCloudStorage({
            backend: createPersonalCloudBackend(
                storageManager,
                { localSettings },
                getDeviceId,
            ),
            storageManager,
            createDeviceId,
            getDeviceId,
            setDeviceId: async (value) =>
                localSettings.setSetting({ key: storageKeys.deviceId, value }),
            getUserId: async () =>
                (await authService.getCurrentUser())?.id ?? null,
            userIdChanges: () => authChanges(authService),
            writeIncomingData: async (params) => {
                // WARNING: Keep in mind this skips all storage middleware
                await updateOrCreate({
                    ...params,
                    storageManager,
                    executeOperation: (...args) =>
                        storageManager.backend.operation(...args),
                })
            },
        }),
    }

    registerModuleMapCollections(storageManager.registry, {
        syncSettings: modules.syncSettings,
        localSettings: modules.localSettings,
        overview: modules.overview,
        metaPicker: modules.metaPicker,
        pageEditor: modules.pageEditor,
        clientSyncLog: modules.clientSyncLog,
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

export async function createServerStorage() {
    const manager = createServerStorageManager()
    const operationExecuter = (storageModuleName: string) =>
        _defaultOperationExecutor(manager)
    const sharedSyncLog = createSharedSyncLog(manager)
    const userManagement = new UserStorage({
        storageManager: manager,
        operationExecuter: operationExecuter('users'),
    })
    const personalCloud = new PersonalCloudServerStorage({
        storageManager: manager,
        autoPkType: 'string',
    })
    registerModuleMapCollections(manager.registry, {
        sharedSyncLog,
        personalCloud,
        userManagement,
    })
    await manager.finishInitialization()
    return {
        manager,
        backend: manager.backend as FirestoreStorageBackend,
        modules: {
            sharedSyncLog,
            userManagement,
            personalCloud,
        },
    }
}
