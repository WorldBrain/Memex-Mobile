import {
    UILogic,
    IncomingUIEvent,
    UIEventHandler,
    UIMutation,
} from 'ui-logic-core'
import { Platform, Dimensions } from 'react-native'
import { EmitterSubscription, KeyboardStatic } from 'react-native'
import type { UIServices, UIStorageModules, ShareNavProps } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { SPECIAL_LIST_IDS } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import { isSyncEnabled, handleSyncError } from 'src/features/sync/utils'
import { areArrayContentsEqual } from 'src/utils/are-arrays-the-same'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import type { State, Event } from './types'
import { isInputDirty, initValues, getDeviceDetails } from './util'
import { FEED_OPEN_URL, READER_URL } from 'src/ui/navigation/deep-linking'
import { ContentScriptLoader } from 'src/features/reader/utils/load-content-script'
import { isUrlYTVideo } from '@worldbrain/memex-common/lib/utils/youtube-url'

export interface Dependencies extends ShareNavProps<'Reader'> {
    services: UIServices<
        | 'cloudSync'
        | 'shareExt'
        | 'errorTracker'
        | 'pageFetcher'
        | 'localStorage'
        | 'actionSheet'
        | 'annotationSharing'
        | 'activityIndicator'
        | 'readability'
        | 'resourceLoader'
    >
    storage: UIStorageModules<
        'overview' | 'metaPicker' | 'pageEditor' | 'reader' | 'pageEditor'
    >
    keyboardAPI: Pick<KeyboardStatic, 'addListener'>
    loadContentScript: ContentScriptLoader
}

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export default class Logic extends UILogic<State, Event> {
    /** If this instance is working with a page that's already indexed, this will be set to the visit time (created in `init`). */
    private existingPageVisitTime: number | null = null
    syncRunning: Promise<void> | null = null
    syncUploadRunning: Promise<void> | null = null
    pageTitleFetchRunning: Promise<void> | null = null
    private initValues = { ...initValues }
    private keyboardShowListener!: EmitterSubscription
    private keyboardHideListener!: EmitterSubscription

    constructor(private deps: Dependencies) {
        super()
    }

    getInitialState(): State {
        return {
            privacyLevel: AnnotationPrivacyLevels.PRIVATE,
            isUnsupportedApplication: false,
            syncRetryState: 'pristine',
            bookmarkState: 'pristine',
            spacesState: 'pristine',
            loadState: 'pristine',
            pageUrl: '',
            pageTitle: '',
            isSpacePickerShown: false,
            showSavingPage: false,
            isModalShown: true,
            noteText: '',
            statusText: '',
            keyboardHeight: 0,
            pageSaveFinished: false,
            deviceInfo: null,
            modalState: 'spacePicker',
            ...initValues,
        }
    }

    private handleSyncError(error: Error) {
        const { errorHandled } = handleSyncError(error, {
            ...this.deps,
            handleAppUpdateNeeded: (title, subtitle) =>
                this.emitMutation({
                    errorMessage: { $set: `${title}\n${subtitle}` },
                }),
        })

        if (!errorHandled) {
            this.emitMutation({ errorMessage: { $set: error.message } })
        }
    }

    private async _doSync() {
        const { cloudSync } = this.deps.services

        try {
            await cloudSync.sync()
            this.clearSyncError()
        } catch (err) {
            this.handleSyncError(err)
        }
    }

    private async doSync() {
        if (this.syncRunning !== null) {
            await this.syncRunning
        }

        this.syncRunning = this._doSync()
        await this.syncRunning
        this.syncRunning = null
    }

    private async _doSyncOnlyUpload() {
        const { cloudSync } = this.deps.services

        try {
            await cloudSync.syncOnlyUpload()
            this.clearSyncError()
        } catch (err) {
            this.handleSyncError(err)
        }
    }

    private async doSyncOnlyUpload() {
        if (this.syncUploadRunning == null) {
            this.syncUploadRunning = this._doSyncOnlyUpload()
        }
        await this.syncUploadRunning
        this.syncUploadRunning = null
    }

    private async fetchAndWritePageTitle(url: string): Promise<void> {
        const {
            services: { errorTracker, pageFetcher },
            storage: {
                modules: { overview },
            },
        } = this.deps

        try {
            const pageTitle = await pageFetcher.fetchPageTitle(url)
            if (pageTitle?.length) {
                await overview.updatePageTitle({
                    url,
                    title: pageTitle,
                })
            }
        } catch (err) {
            errorTracker.track(err)
        }
    }

    cleanup: EventHandler<'cleanup'> = async ({}) => {
        await this.deps.services.shareExt.close()
        this.keyboardShowListener.remove()
        this.keyboardHideListener.remove()
    }

    private async maybeOpenInReader(
        state: State,
    ): Promise<{ openInReader: boolean }> {
        if (Platform.OS !== 'ios' || !isUrlYTVideo(state.pageUrl)) {
            return { openInReader: false }
        }

        // await loadInitial(this, async () => {
        //     await this.storePageInit(state)
        //     await this.fetchAndWritePageTitle(state.pageUrl)
        // })
        this.deps.services.shareExt.openAppLink(
            READER_URL + encodeURIComponent(state.pageUrl),
        )
        return { openInReader: true }
    }

    init: EventHandler<'init'> = async ({ previousState }) => {
        this.handleDimensionsChange()
        Dimensions.addEventListener('change', this.handleDimensionsChange)
        const { services, storage } = this.deps
        let url: string

        try {
            url = await services.shareExt.getSharedUrl()
        } catch (err) {
            this.emitMutation({ isUnsupportedApplication: { $set: true } })
            return
        }

        const mutation: UIMutation<State> = { pageUrl: { $set: url } }
        const nextState = this.withMutation(previousState, mutation)
        this.emitMutation(mutation)

        this.keyboardShowListener = this.deps.keyboardAPI.addListener(
            'keyboardDidShow',
            (event) =>
                this.emitMutation({
                    keyboardHeight: { $set: event.endCoordinates.height },
                }),
        )
        this.keyboardHideListener = this.deps.keyboardAPI.addListener(
            'keyboardDidHide',
            (event) => this.emitMutation({ keyboardHeight: { $set: 0 } }),
        )

        const existingPage = await storage.modules.overview.findPage({ url })

        // No need to do state hydration from DB if this is new page, just index it
        if (existingPage == null) {
            this.emitMutation({
                spacesToAdd: {
                    $set: [],
                },
                spacesState: { $set: 'done' },
            })

            this.initValues.spacesToAdd = []
            await loadInitial(this, async () => {
                await this.storePageInit(nextState)
            })
            this.pageTitleFetchRunning = this.fetchAndWritePageTitle(url)
            this.showPageSavedMessage()
            this.emitMutation({
                loadState: { $set: 'done' },
                spacesState: { $set: 'done' },
            })
            return
        }

        if (!existingPage?.fullTitle?.length) {
            this.pageTitleFetchRunning = this.fetchAndWritePageTitle(url)
        }

        this.existingPageVisitTime = Date.now()

        try {
            await storage.modules.overview.visitPage({
                url,
                time: this.existingPageVisitTime,
            })
        } catch (err) {
            services.errorTracker.track(err)
        }

        await this.doSyncOnlyUpload()
        this.showPageSavedMessage()
        const bookmarkP = executeUITask<State, 'bookmarkState', void>(
            this,
            'bookmarkState',
            async () => {
                try {
                    const isStarred = await storage.modules.overview.isPageStarred(
                        {
                            url,
                        },
                    )

                    this.emitMutation({ isStarred: { $set: isStarred } })
                    this.initValues.isStarred = isStarred
                } catch (err) {
                    services.errorTracker.track(err)
                    throw err
                }
            },
        )

        const listsP = executeUITask<State, 'spacesState', void>(
            this,
            'spacesState',
            async () => {
                try {
                    this.emitMutation({ spacesState: { $set: 'running' } })
                    const spaces =
                        (await storage.modules.metaPicker.findListsByPage({
                            url,
                            includeRemoteIds: true,
                        })) ?? []
                    const spacesToAdd = spaces?.map((c) => c.id) ?? []

                    this.emitMutation({
                        spacesToAdd: {
                            $set: spacesToAdd,
                        },
                    })

                    this.initValues.spacesToAdd = spacesToAdd
                    this.emitMutation({
                        spacesState: { $set: 'done' },
                    })
                } catch (err) {
                    services.errorTracker.track(err)
                    throw err
                }
            },
        )

        await Promise.all([bookmarkP, listsP])
    }

    private handleDimensionsChange = () => {
        const deviceInfo = getDeviceDetails()

        this.emitMutation({
            deviceInfo: { $set: deviceInfo },
        })
    }

    showPageSavedMessage() {
        this.emitMutation({
            pageSaveFinished: { $set: true },
        })
        setTimeout(() => {
            this.emitMutation({
                pageSaveFinished: { $set: false },
            })
        }, 4000)
    }

    async retrySync() {
        await executeUITask<State, 'syncRetryState', void>(
            this,
            'syncRetryState',
            async () => this.doSync(),
        )
    }

    clearSyncError() {
        this.emitMutation({ errorMessage: { $set: undefined } })
    }

    setPageUrl(
        incoming: IncomingUIEvent<State, Event, 'setPageUrl'>,
    ): UIMutation<State> {
        return { pageUrl: { $set: incoming.event.url } }
    }

    setStatusText(
        incoming: IncomingUIEvent<State, Event, 'setStatusText'>,
    ): UIMutation<State> {
        return { statusText: { $set: incoming.event.value } }
    }

    setModalVisible(
        incoming: IncomingUIEvent<State, Event, 'setModalVisible'>,
    ): UIMutation<State> {
        return { isModalShown: { $set: incoming.event.shown } }
    }

    setNoteText(
        incoming: IncomingUIEvent<State, Event, 'setNoteText'>,
    ): UIMutation<State> {
        return { noteText: { $set: incoming.event.value } }
    }

    setPageStar(
        incoming: IncomingUIEvent<State, Event, 'setPageStar'>,
    ): UIMutation<State> {
        return { isStarred: { $set: incoming.event.value } }
    }

    setSpacesToAdd(
        incoming: IncomingUIEvent<State, Event, 'setSpacesToAdd'>,
    ): UIMutation<State> {
        return { spacesToAdd: { $set: incoming.event.values } }
    }

    setPrivacyLevel: EventHandler<'setPrivacyLevel'> = ({ event }) => {
        this.emitMutation({ privacyLevel: { $set: event.value } })
    }
    setModalState: EventHandler<'setModalState'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({ modalState: { $set: event.state } })
        if (event.state === 'reader' || event.state === 'AI') {
            const { openInReader } = await this.maybeOpenInReader(previousState)
            if (openInReader) {
                await this.deps.services.shareExt.close()
                return
            }
            if (event.state === 'reader') {
                await this.doSync()
            }
        }
    }

    toggleSpace(
        incoming: IncomingUIEvent<State, Event, 'toggleSpace'>,
    ): UIMutation<State> {
        return {
            spacesToAdd: (state) => {
                const index = state.indexOf(incoming.event.id)

                if (index !== -1) {
                    return [...state.slice(0, index), ...state.slice(index + 1)]
                }

                return [...state, incoming.event.id]
            },
        }
    }

    togglePageStar(
        incoming: IncomingUIEvent<State, Event, 'togglePageStar'>,
    ): UIMutation<State> {
        return {
            isStarred: { $set: !incoming.previousState.isStarred },
        }
    }

    async undoPageSave(
        incoming: IncomingUIEvent<State, Event, 'undoPageSave'>,
    ) {
        const { overview } = this.deps.storage.modules

        this.emitMutation({ showSavingPage: { $set: true } })
        await this.pageTitleFetchRunning

        try {
            // Only delete the visit if this page was indexed prior, else delete the page if newly indexed
            if (this.existingPageVisitTime) {
                await overview.deleteVisit({
                    url: incoming.previousState.pageUrl,
                    time: this.existingPageVisitTime,
                })
            } else {
                await overview.deletePage({
                    url: incoming.previousState.pageUrl,
                })
            }
        } catch (err) {
        } finally {
            this.emitMutation({ isModalShown: { $set: false } })
        }
    }

    async save({
        previousState,
        event,
    }: IncomingUIEvent<State, Event, 'save'>) {
        await this.pageTitleFetchRunning

        if (isInputDirty(previousState) || this.syncRunning != null) {
            this.emitMutation({ showSavingPage: { $set: true } })
            await this.storePageFinal(previousState)

            if (
                (await isSyncEnabled(this.deps.services)) &&
                this.syncRunning == null
            ) {
                await this.doSyncOnlyUpload()
            }
        }

        if (event.thenGoToApp) {
            this.deps.services.shareExt.openAppLink(FEED_OPEN_URL)
        }

        this.emitMutation({ isModalShown: { $set: false } })
    }

    setSpacePickerShown(
        incoming: IncomingUIEvent<State, Event, 'setSpacePickerShown'>,
    ) {
        this.emitMutation({
            isSpacePickerShown: { $set: incoming.event.isShown },
            statusText: { $set: incoming.event.isShown ? 'Spaces' : '' },
        })
    }

    metaPickerEntryPress(
        incoming: IncomingUIEvent<State, Event, 'metaPickerEntryPress'>,
    ) {
        this.emitMutation(
            this.toggleSpace({
                ...incoming,
                event: { id: incoming.event.entry.id },
            }),
        )
    }

    private async storePage(state: State, customTimestamp?: number) {
        await this.storePageInit(state)
        await this.storePageFinal(state, customTimestamp)
    }

    private async storePageInit(state: State) {
        const { overview, metaPicker } = this.deps.storage.modules

        await overview.createPage({
            url: state.pageUrl,
            fullUrl: state.pageUrl,
            fullTitle: state.pageTitle,
            text: '',
        })

        await overview.visitPage({ url: state.pageUrl })

        await metaPicker.createInboxListEntry({ fullPageUrl: state.pageUrl })
        await metaPicker.createMobileListEntry({ fullPageUrl: state.pageUrl })
    }

    private async storePageFinal(state: State, customTimestamp?: number) {
        const { overview, metaPicker, pageEditor } = this.deps.storage.modules
        const { annotationSharing } = this.deps.services

        await overview.setPageStar({
            url: state.pageUrl,
            isStarred: state.isStarred,
        })

        const hasNote = state.noteText?.trim().length > 0
        if (hasNote) {
            const { annotationUrl } = await pageEditor.createNote(
                {
                    comment: state.noteText.trim(),
                    pageUrl: state.pageUrl,
                    pageTitle: state.pageTitle,
                },
                customTimestamp,
                { skipPrivacyLevelCreation: true },
            )
            await annotationSharing.setAnnotationPrivacyLevel({
                annotationUrl,
                privacyLevel: state.privacyLevel,
            })

            if (state.spacesToAdd.length) {
                await annotationSharing.addAnnotationToLists({
                    annotationUrl,
                    listIds: state.spacesToAdd,
                    protectAnnotation: true,
                })
            }
        } else if (
            !areArrayContentsEqual(
                state.spacesToAdd,
                this.initValues.spacesToAdd,
            )
        ) {
            await metaPicker.setPageLists({
                fullPageUrl: state.pageUrl,
                listIds: [
                    ...(hasNote ? [] : state.spacesToAdd), // If there is a note, don't add page to the set spaces
                    SPECIAL_LIST_IDS.MOBILE,
                    SPECIAL_LIST_IDS.INBOX,
                ],
            })
        }
    }
}
