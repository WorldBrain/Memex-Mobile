import type { URLNormalizer } from '@worldbrain/memex-url-utils'
import type { AuthService } from '@worldbrain/memex-common/lib/authentication/types'
import { storageKeys } from '../../app.json'

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
import type { Storage } from 'src/storage/types'
import type { PersonalCloudBackend } from '@worldbrain/memex-common/lib/personal-cloud/backend/types'
import AnnotationSharingService from '@worldbrain/memex-common/lib/content-sharing/service/annotation-sharing'
import type { GenerateServerID } from '@worldbrain/memex-common/lib/content-sharing/service/types'

export interface CreateServicesOptions {
    auth?: AuthService
    firebase?: any
    storage: Storage
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
    const auth =
        (options.auth as MemexGoAuthService) ??
        new MemexGoAuthService(options.firebase)
    const pageFetcher = new PageFetcherService()

    return {
        auth,
        pageFetcher,
        keepAwake: new KeepAwakeService({ keepAwakeLib: options.keepAwakeLib }),
        cloudSync: new CloudSyncService({
            backend: options.personalCloudBackend,
            storageManager: options.storage.manager,
            storage: storageModules.personalCloud,
            errorTrackingService: options.errorTracker,
            setLastUpdateProcessedTime: (value) =>
                storageModules.localSettings.setSetting({
                    key: storageKeys.lastSeenUpdateTime,
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
        annotationSharing: new AnnotationSharingService({
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
                getAnnotation: (url) =>
                    storageModules.pageEditor.findNote({ url }),
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
        }),
    }
}
