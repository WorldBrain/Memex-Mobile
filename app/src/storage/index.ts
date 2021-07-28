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
import { SYNCED_COLLECTIONS } from '@worldbrain/memex-common/lib/sync/constants'
import PersonalCloudServerStorage from '@worldbrain/memex-common/lib/personal-cloud/storage'

import defaultConnectionOpts from './default-connection-opts'
import { Storage } from './types'
import { SettingsStorage } from 'src/features/settings/storage'
import { ReaderStorage } from 'src/features/reader/storage'
import { Services } from 'src/services/types'
import { createServerStorageManager } from './server'
import { createSharedSyncLog } from 'src/services/sync/shared-sync-log'
import {
    MemexClientSyncLogStorage,
    MemexSyncInfoStorage,
} from 'src/features/sync/storage'
import { StorageOperationEvent } from '@worldbrain/storex-middleware-change-watcher/lib/types'
import { filterSyncLog } from '@worldbrain/memex-common/lib/sync/sync-logging'
import { DexieStorageBackend } from '@worldbrain/storex-backend-dexie'
import inMemory from '@worldbrain/storex-backend-dexie/lib/in-memory'
import extractTerms from '@worldbrain/memex-stemmer'
import { PersonalCloudStorage } from 'src/features/personal-cloud/storage'
import { authChanges } from '@worldbrain/memex-common/lib/authentication/utils'
import { FirestoreStorageBackend } from '@worldbrain/storex-backend-firestore'
import type {
    PersonalCloudBackend,
    PersonalCloudDeviceId,
} from '@worldbrain/memex-common/lib/personal-cloud/backend/types'

export interface CreateStorageOptions {
    services: Pick<Services, 'auth'>
    typeORMConnectionOpts?: ConnectionOptions
    createDeviceId: (userId: string | number) => Promise<string | number>
    createPersonalCloudBackend: (
        storageManager: StorageManager,
        modules: Pick<Storage['modules'], 'settings'>,
        getDeviceId: () => Promise<PersonalCloudDeviceId>,
    ) => PersonalCloudBackend
}

export async function createStorage({
    services,
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
    const settings = new SettingsStorage({ storageManager })

    const getDeviceId = async () => settings.getSetting({ key: 'deviceId' })

    const modules: Storage['modules'] = {
        settings,
        overview: new OverviewStorage({
            storageManager,
            normalizeUrl,
            extractUrlParts,
        }),
        metaPicker: new MetaPickerStorage({ storageManager, normalizeUrl }),
        pageEditor: new PageEditorStorage({ storageManager, normalizeUrl }),
        clientSyncLog: new MemexClientSyncLogStorage({ storageManager }),
        syncInfo: new MemexSyncInfoStorage({ storageManager }),
        reader: new ReaderStorage({ storageManager, normalizeUrl }),
        contentSharing: new ContentSharingClientStorage({ storageManager }),
        personalCloud: new PersonalCloudStorage({
            backend: createPersonalCloudBackend(
                storageManager,
                {
                    settings,
                },
                getDeviceId,
            ),
            storageManager,
            createDeviceId,
            getDeviceId,
            setDeviceId: async (value) =>
                settings.setSetting({ key: 'deviceId', value }),
            getUserId: async () =>
                (await services.auth.getCurrentUser())?.id ?? null,
            userIdChanges: () => authChanges(services.auth),
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
        settings: modules.settings,
        overview: modules.overview,
        metaPicker: modules.metaPicker,
        pageEditor: modules.pageEditor,
        clientSyncLog: modules.clientSyncLog,
        syncInfo: modules.syncInfo,
        reader: modules.reader,
        contentSharing: modules.contentSharing,
        personalCloudAction: modules.personalCloud.actionQueue.storage,
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
    services: Services
    enableAutoSync?: boolean
    extraPostChangeWatcher?: (
        context: StorageOperationEvent<'post'>,
    ) => void | Promise<void>
}) {
    const syncedCollections = new Set(SYNCED_COLLECTIONS)
    const syncLoggingMiddleware = await options.services.sync.createSyncLoggingMiddleware()
    syncLoggingMiddleware.changeInfoPreprocessor = filterSyncLog
    options.storage.manager.setMiddleware([
        new ChangeWatchMiddleware({
            storageManager: options.storage.manager,
            shouldWatchCollection: (collection) => {
                return syncedCollections.has(collection)
            },
            postprocessOperation: async (context) => {
                if (options.enableAutoSync) {
                    await options.services.sync.handleStorageChange(context)
                }
                if (options.extraPostChangeWatcher) {
                    await options.extraPostChangeWatcher(context)
                }
            },
        }),
        syncLoggingMiddleware,
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
