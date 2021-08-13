// tslint:disable:no-console
import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { MetaType, MetaTypeShape } from 'src/features/meta-picker/types'
import {
    UITaskState,
    UIServices,
    UIStorageModules,
    MainNavProps,
    ShareNavProps,
} from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { SPECIAL_LIST_NAMES } from '@worldbrain/memex-storage/lib/lists/constants'
import { getMetaTypeName } from 'src/features/meta-picker/utils'
import { isSyncEnabled, handleSyncError } from 'src/features/sync/utils'

export interface State {
    loadState: UITaskState
    tagsState: UITaskState
    bookmarkState: UITaskState
    syncRetryState: UITaskState
    collectionsState: UITaskState

    pageUrl: string
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
    save: null
    savePageTitle: null
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
    pageTitleFetchRunning: Promise<string> | null = null
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
            await cloudSync.runContinuousSync()
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

    private async fetchPageTitle(url: string): Promise<string> {
        const { pageFetcher } = this.props.services

        const doc = await pageFetcher.fetchPageDOM(url)
        return doc.title
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        this.doSync()

        let url: string

        try {
            url = await this.props.services.shareExt.getSharedUrl()
        } catch (err) {
            this.emitMutation({ isUnsupportedApplication: { $set: true } })
            return
        }

        this.emitMutation({ pageUrl: { $set: url } })

        const { overview, metaPicker } = this.props.storage.modules

        const existingPage = await overview.findPage({ url })

        if (!existingPage?.fullTitle?.length) {
            this.pageTitleFetchRunning = this.fetchPageTitle(url)
        }

        // No need to do state hydration from DB if this is new page, just index it
        if (existingPage == null) {
            await loadInitial<State>(this, async () => {
                await this.storePageInit({ pageUrl: url } as State)
            })
            return
        }

        this.existingPageVisitTime = Date.now()
        await overview.visitPage({ url, time: this.existingPageVisitTime })

        const bookmarkP = executeUITask<State, 'bookmarkState', void>(
            this,
            'bookmarkState',
            async () => {
                const isStarred = await overview.isPageStarred({ url })

                this.emitMutation({ isStarred: { $set: isStarred } })
                this.initValues.isStarred = isStarred
            },
        )

        const tagsP = executeUITask<State, 'tagsState', void>(
            this,
            'tagsState',
            async () => {
                const tags = await metaPicker.findTagsByPage({ url })
                const tagsToAdd = tags.map((tag) => tag.name)

                this.emitMutation({ tagsToAdd: { $set: tagsToAdd } })
                this.initValues.tagsToAdd = tagsToAdd
            },
        )

        const listsP = executeUITask<State, 'collectionsState', void>(
            this,
            'collectionsState',
            async () => {
                const collections = await metaPicker.findListsByPage({
                    url,
                })
                const collectionsToAdd = collections.map((c) => c.name)

                this.emitMutation({
                    collectionsToAdd: {
                        $set: collectionsToAdd,
                    },
                })
                this.initValues.collectionsToAdd = collectionsToAdd
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

    async savePageTitle({
        previousState,
    }: IncomingUIEvent<State, Event, 'savePageTitle'>) {
        // Init logic somehow was not run due to page title already being indexed
        if (!this.pageTitleFetchRunning) {
            return
        }

        const { overview } = this.props.storage.modules
        const { errorTracker } = this.props.services

        try {
            const pageTitle = await this.pageTitleFetchRunning
            await overview.updatePageTitle({
                url: previousState.pageUrl,
                title: pageTitle,
            })
        } catch (err) {
            errorTracker.track(err)
        }
    }

    async save({ previousState }: IncomingUIEvent<State, Event, 'save'>) {
        this.emitMutation({ showSavingPage: { $set: true } })
        await this.storePageFinal(previousState)

        if (await isSyncEnabled(this.props.services)) {
            await this.doSync()
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
            text: '',
            fullTitle: '',
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
            lists: [...state.collectionsToAdd, SPECIAL_LIST_NAMES.MOBILE],
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
                    pageTitle: '',
                },
                customTimestamp,
            )
        }
    }
}
