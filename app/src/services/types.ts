import type { CloudSyncAPI } from './cloud-sync/types'
import type { MemexGoAuthService } from './auth'
import type { KeychainService } from './keychain'
import type { ShareExtService } from './share-ext'
import type { ReadabilityService } from './readability'
import type { StorageService } from './settings-storage'
import type { ErrorTrackingService } from './error-tracking'
import type { BackgroundProcessService } from './background-processing'
import type { ResourceLoaderService } from './resource-loader'
import type { PageFetcherService } from './page-fetcher'
import type { ActionSheetService } from './action-sheet'
import type { KeepAwakeService } from './keep-awake'
import type { AnnotationSharingServiceInterface } from '@worldbrain/memex-common/lib/content-sharing/service/types'
import type {
    ListSharingServiceInterface,
    ListKeysServiceInterface,
} from '@worldbrain/memex-common/lib/content-sharing/service/types'
import type { ActivityStreamsService } from '@worldbrain/memex-common/lib/activity-streams/types'
export interface Services {
    auth: MemexGoAuthService
    cloudSync: CloudSyncAPI
    shareExt: ShareExtService
    keychain: KeychainService
    keepAwake: KeepAwakeService
    actionSheet: ActionSheetService
    readability: ReadabilityService
    pageFetcher: PageFetcherService
    syncStorage: StorageService
    localStorage: StorageService
    errorTracker: ErrorTrackingService
    listKeys: ListKeysServiceInterface
    resourceLoader: ResourceLoaderService
    activityStreams: ActivityStreamsService
    listSharing: ListSharingServiceInterface
    backgroundProcess: BackgroundProcessService
    annotationSharing: AnnotationSharingServiceInterface
}

export type ServiceStarter<ServiceNames extends keyof Services> = (args: {
    services: Pick<Services, ServiceNames>
}) => Promise<void>
