import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { MetaType, MetaTypeShape } from 'src/features/meta-picker/types'
import {
    UITaskState,
    UIServices,
    UIStorageModules,
    ShareNavProps,
} from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { SPECIAL_LIST_NAMES } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import { getMetaTypeName } from 'src/features/meta-picker/utils'
import { isSyncEnabled, handleSyncError } from 'src/features/sync/utils'

export interface State {
    loadState: UITaskState
    tagsState: UITaskState
    bookmarkState: UITaskState
    syncRetryState: UITaskState
    collectionsState: UITaskState

    pageUrl: string
    pageTitle: string
    statusText: string
    noteText: string
    tagsToAdd: string[]
    collectionsToAdd: string[]
    isStarred: boolean
    isModalShown: boolean
    errorMessage?: string
    showSavingPage: boolean
    isUnsupportedApplication: boolean
    metaViewShown?: MetaType
}

export type Event = UIEvent<{
    save: { isInputDirty?: boolean }
    retrySync: null

    undoPageSave: null
    metaPickerEntryPress: { entry: MetaTypeShape }
    setMetaViewType: { type?: MetaType }
    setModalVisible: { shown: boolean }
    togglePageStar: null
    setNoteText: { value: string }

    toggleTag: { name: string }
    toggleCollection: { name: string }
    setPageUrl: { url: string }
    setPageStar: { value: boolean }
    setStatusText: { value: string }
    setCollectionsToAdd: { values: string[] }
    clearSyncError: null
}>

export interface Props extends ShareNavProps<'ShareModal'> {
    services: UIServices<
        | 'cloudSync'
        | 'shareExt'
        | 'errorTracker'
        | 'localStorage'
        | 'syncStorage'
        | 'pageFetcher'
    >
    storage: UIStorageModules<'overview' | 'metaPicker' | 'pageEditor'>
}

export default class Logic extends UILogic<State, Event> {
    /** If this instance is working with a page that's already indexed, this will be set to the visit time (created in `init`). */
    private existingPageVisitTime: number | null = null
    syncRunning: Promise<void> | null = null
    pageTitleFetchRunning: Promise<void> | null = null
    initValues: Pick<State, 'isStarred' | 'tagsToAdd' | 'collectionsToAdd'> = {
        isStarred: false,
        tagsToAdd: [],
        collectionsToAdd: [],
    }

    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            isUnsupportedApplication: false,
            loadState: 'pristine',
            syncRetryState: 'pristine',
            bookmarkState: 'pristine',
            tagsState: 'pristine',
            collectionsState: 'pristine',
            pageUrl: '',
            pageTitle: '',
            showSavingPage: false,
            isModalShown: true,
            noteText: '',
            statusText: '',
            ...this.initValues,
        }
    }

    private handleSyncError(error: Error) {
        const { errorHandled } = handleSyncError(error, {
            ...this.props,
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
        const { cloudSync } = this.props.services

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

    private async fetchAndWritePageTitle(url: string): Promise<void> {
        const {
            services: { errorTracker, pageFetcher },
            storage: {
                modules: { overview },
            },
        } = this.props

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

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        this.doSync()

        const { services, storage } = this.props
        let url: string

        try {
            url = await services.shareExt.getSharedUrl()
        } catch (err) {
            this.emitMutation({ isUnsupportedApplication: { $set: true } })
            return
        }

        this.emitMutation({ pageUrl: { $set: url } })

        const existingPage = await storage.modules.overview.findPage({ url })

        // No need to do state hydration from DB if this is new page, just index it
        if (existingPage == null) {
            await loadInitial<State>(this, async () => {
                await this.storePageInit({ pageUrl: url } as State)
            })
            this.pageTitleFetchRunning = this.fetchAndWritePageTitle(url)
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

        const tagsP = executeUITask<State, 'tagsState', void>(
            this,
            'tagsState',
            async () => {
                try {
                    const tags = await storage.modules.metaPicker.findTagsByPage(
                        {
                            url,
                        },
                    )
                    const tagsToAdd = tags.map((tag) => tag.name)

                    this.emitMutation({ tagsToAdd: { $set: tagsToAdd } })
                    this.initValues.tagsToAdd = tagsToAdd
                } catch (err) {
                    services.errorTracker.track(err)
                    throw err
                }
            },
        )

        const listsP = executeUITask<State, 'collectionsState', void>(
            this,
            'collectionsState',
            async () => {
                try {
                    const collections = await storage.modules.metaPicker.findListsByPage(
                        {
                            url,
                        },
                    )
                    const collectionsToAdd = collections.map((c) => c.name)

                    this.emitMutation({
                        collectionsToAdd: {
                            $set: collectionsToAdd,
                        },
                    })

                    this.initValues.collectionsToAdd = collectionsToAdd
                } catch (err) {
                    services.errorTracker.track(err)
                    throw err
                }
            },
        )

        await Promise.all([bookmarkP, tagsP, listsP])
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

    setCollectionsToAdd(
        incoming: IncomingUIEvent<State, Event, 'setCollectionsToAdd'>,
    ): UIMutation<State> {
        return { collectionsToAdd: { $set: incoming.event.values } }
    }

    toggleTag(
        incoming: IncomingUIEvent<State, Event, 'toggleTag'>,
    ): UIMutation<State> {
        return {
            tagsToAdd: (state) => {
                const index = state.indexOf(incoming.event.name)

                if (index !== -1) {
                    return [...state.slice(0, index), ...state.slice(index + 1)]
                }

                return [...state, incoming.event.name]
            },
        }
    }

    toggleCollection(
        incoming: IncomingUIEvent<State, Event, 'toggleCollection'>,
    ): UIMutation<State> {
        return {
            collectionsToAdd: (state) => {
                const index = state.indexOf(incoming.event.name)

                if (index !== -1) {
                    return [...state.slice(0, index), ...state.slice(index + 1)]
                }

                return [...state, incoming.event.name]
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
        const { overview } = this.props.storage.modules

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

        if (event.isInputDirty) {
            this.emitMutation({ showSavingPage: { $set: true } })
            await this.storePageFinal(previousState)

            if (await isSyncEnabled(this.props.services)) {
                await this.doSync()
            }
        }

        this.emitMutation({ isModalShown: { $set: false } })
    }

    setMetaViewType(
        incoming: IncomingUIEvent<State, Event, 'setMetaViewType'>,
    ) {
        this.emitMutation({
            metaViewShown: { $set: incoming.event.type },
            statusText: {
                $set: incoming.event.type
                    ? getMetaTypeName(incoming.event.type)
                    : '',
            },
        })
    }

    metaPickerEntryPress(
        incoming: IncomingUIEvent<State, Event, 'metaPickerEntryPress'>,
    ) {
        const event = {
            ...incoming,
            event: { name: incoming.event.entry.name },
        }

        const mutation =
            incoming.previousState.metaViewShown === 'tags'
                ? this.toggleTag(event)
                : this.toggleCollection(event)

        this.emitMutation(mutation)
    }

    private async storePage(state: State, customTimestamp?: number) {
        await this.storePageInit(state)
        await this.storePageFinal(state, customTimestamp)
    }

    private async storePageInit(state: State) {
        const { overview, metaPicker } = this.props.storage.modules

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
        const { overview, metaPicker, pageEditor } = this.props.storage.modules

        await overview.setPageStar({
            url: state.pageUrl,
            isStarred: state.isStarred,
        })

        await metaPicker.setPageLists({
            fullPageUrl: state.pageUrl,
            lists: [
                ...state.collectionsToAdd,
                SPECIAL_LIST_NAMES.MOBILE,
                SPECIAL_LIST_NAMES.INBOX,
            ],
        })
        await metaPicker.setPageTags({
            url: state.pageUrl,
            tags: state.tagsToAdd,
        })

        if (state.noteText?.trim().length > 0) {
            await pageEditor.createNote(
                {
                    comment: state.noteText.trim(),
                    pageUrl: state.pageUrl,
                    pageTitle: state.pageTitle,
                },
                customTimestamp,
            )
        }
    }
}
