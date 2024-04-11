import type { AuthService } from '@worldbrain/memex-common/lib/authentication/types'
import { storageKeys } from '../../app.json'
import type { ReactNativeFirebase } from '@react-native-firebase/app'

import type { Services } from './types'
import { ShareExtService } from './share-ext'
import type { ErrorTrackingService } from './error-tracking'

import { BackgroundProcessService } from './background-processing'
import { MemexGoAuthService } from './auth'
import { KeychainService } from './keychain'
import type { KeychainAPI } from './keychain/types'
import { ReadabilityService } from './readability'
import { ResourceLoaderService } from './resource-loader'
import { PageFetcherService } from './page-fetcher'
import { StorageService } from './settings-storage'
import { CloudSyncService } from './cloud-sync'
import { KeepAwakeService, KeepAwakeAPI } from './keep-awake'
import type { Storage, ServerStorage } from 'src/storage/types'
import type { PersonalCloudBackend } from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import AnnotationSharingService from '@worldbrain/memex-common/lib/content-sharing/service/annotation-sharing'
import type { GenerateServerID } from '@worldbrain/memex-common/lib/content-sharing/service/types'
import { ActionSheetService } from './action-sheet'
import ListKeysService from './content-sharing/list-keys'
import ListSharingService from '@worldbrain/memex-common/lib/content-sharing/service/list-sharing'
import FirebaseFunctionsActivityStreamsService from '@worldbrain/memex-common/lib/activity-streams/services/firebase-functions/client'
import MemoryStreamsService from '@worldbrain/memex-common/lib/activity-streams/services/memory'
import ActivityIndicatorService from '@worldbrain/memex-common/lib/activity-streams/services/activity-indicator'
import type { URLNormalizer } from '@worldbrain/memex-common/lib/url-utils/normalize/types'

export interface CreateServicesOptions {
    auth: AuthService
    firebase?: ReactNativeFirebase.Module
    storage: Storage
    serverStorage: ServerStorage
    keychain: KeychainAPI
    keepAwakeLib?: KeepAwakeAPI
    errorTracker: ErrorTrackingService
    normalizeUrl: URLNormalizer
    generateServerId: GenerateServerID
    personalCloudBackend: PersonalCloudBackend
}

export async function createServices(
    options: CreateServicesOptions,
): Promise<Services> {
    const { modules: storageModules } = options.storage
    const { modules: serverStorageModules } = options.serverStorage
    const auth = options.auth as MemexGoAuthService
    const pageFetcher = new PageFetcherService()
    const listKeys = new ListKeysService({
        serverStorage: serverStorageModules.contentSharing,
    })

    const annotationSharing = new AnnotationSharingService({
        addToListSuggestions: (listId) =>
            storageModules.metaPicker.updateListSuggestionsCache({
                added: listId,
            }),
        generateServerId: options.generateServerId,
        storage: storageModules.contentSharing,
        listStorage: {
            insertPageToList: (entry) =>
                storageModules.metaPicker.createPageListEntry(entry),
            getEntriesForPage: (url) =>
                storageModules.metaPicker.findPageListEntriesByPage({
                    url,
                }),
        },
        annotationStorage: {
            getAnnotation: (url) => storageModules.pageEditor.findNote({ url }),
            getAnnotations: (urls) =>
                storageModules.pageEditor.findNotes({ urls }),
            getEntriesForAnnotation: (annotationUrl) =>
                storageModules.metaPicker.findAnnotListEntriesByAnnot({
                    annotationUrl,
                }),
            getEntriesForAnnotations: (annotationUrls) =>
                storageModules.metaPicker.findAnnotListEntriesByAnnots({
                    annotationUrls,
                }),
            ensureAnnotationInList: (entry) =>
                storageModules.metaPicker.ensureAnnotationInList(entry),
            insertAnnotationToList: (entry) =>
                storageModules.metaPicker.createAnnotListEntry(entry),
            removeAnnotationFromList: (entry) =>
                storageModules.metaPicker.deleteAnnotEntryFromList(entry),
        },
    })

    const activityStreams =
        options.firebase != null
            ? new FirebaseFunctionsActivityStreamsService({
                  executeCall: async (name, params) => {
                      const functions = options.firebase!.functions()
                      const result = await functions.httpsCallable(name)(params)
                      return result.data
                  },
              })
            : new MemoryStreamsService({
                  storage: {
                      contentConversations:
                          serverStorageModules.contentConversations,
                      contentSharing: serverStorageModules.contentSharing,
                      users: serverStorageModules.userManagement,
                  },
                  getCurrentUserId: async () =>
                      (await auth.getCurrentUser())?.id ?? null,
              })

    const activityIndicator = new ActivityIndicatorService({
        authService: auth,
        activityStreamsService: activityStreams,
        activityStreamsStorage: serverStorageModules.activityStreams,
        captureError: (err) => options.errorTracker.track(err),
        getStatusCacheFlag: async () =>
            (await storageModules.syncSettings.getSetting<boolean>({
                key: '@ActivityIndicator-feedHasActivity',
            })) ?? false,
        setStatusCacheFlag: (value) =>
            storageModules.syncSettings.setSetting({
                key: '@ActivityIndicator-feedHasActivity',
                value,
            }),
    })

    return {
        auth,
        listKeys,
        pageFetcher,
        activityStreams,
        activityIndicator,
        annotationSharing,
        actionSheet: new ActionSheetService(),
        keepAwake: new KeepAwakeService({ keepAwakeLib: options.keepAwakeLib }),
        listSharing: new ListSharingService({
            waitForSync: () =>
                storageModules.personalCloud.pushAllQueuedUpdates(),
            listKeysService: listKeys,
            annotationSharingService: annotationSharing,
            generateServerId: options.generateServerId,
            storage: storageModules.contentSharing,
            listStorage: {
                getList: (id) => storageModules.metaPicker.findListById({ id }),
                getListEntriesForPages: (e) =>
                    storageModules.metaPicker.fetchListPageEntriesByUrls(e),
                insertPageToList: (e) =>
                    storageModules.metaPicker.createPageListEntry(e),
            },
            annotationStorage: {
                getAnnotations: (urls) =>
                    storageModules.pageEditor.findNotes({ urls }),
                getEntriesByList: (listId) =>
                    storageModules.metaPicker.findAnnotListEntriesByList({
                        listId,
                    }),
                insertAnnotationToList: (entry) =>
                    storageModules.metaPicker.createAnnotListEntry(entry),
                removeAnnotationFromList: (entry) =>
                    storageModules.metaPicker.deleteAnnotEntryFromList(entry),
            },
        }),
        cloudSync: new CloudSyncService({
            backend: options.personalCloudBackend,
            storageManager: options.storage.manager,
            storage: storageModules.personalCloud,
            errorTrackingService: options.errorTracker,
            setRetroSyncLastProcessedTime: (value) =>
                storageModules.localSettings.setSetting({
                    key: storageKeys.retroSyncLastProcessedTime,
                    value,
                }),
            setSyncLastProcessedTime: (value) =>
                storageModules.localSettings.setSetting({
                    key: storageKeys.syncLastProcessedTime,
                    value,
                }),
        }),
        localStorage: new StorageService({
            settingsStorage: storageModules.localSettings,
        }),
        syncStorage: new StorageService({
            settingsStorage: storageModules.syncSettings,
        }),
        shareExt: new ShareExtService({ normalizeUrl: options.normalizeUrl }),
        backgroundProcess: new BackgroundProcessService({}),
        keychain: new KeychainService({ keychain: options.keychain }),
        errorTracker: options.errorTracker,
        readability: new ReadabilityService({ pageFetcher }),
        resourceLoader: new ResourceLoaderService({}),
    }
}
