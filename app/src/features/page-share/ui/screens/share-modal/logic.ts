// tslint:disable:no-console
import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { SyncReturnValue } from '@worldbrain/storex-sync'

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
import {
    shouldAutoSync,
    isSyncEnabled,
    handleSyncError,
} from 'src/features/sync/utils'

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
    services: UIServices<'sync' | 'shareExt' | 'errorTracker' | 'localStorage'>
    storage: UIStorageModules<'overview' | 'metaPicker' | 'pageEditor'>
}

export default class Logic extends UILogic<State, Event> {
    /** If this instance is working with a page that's already indexed, this will be set to the visit time (created in `init`). */
    private existingPageVisitTime: number | null = null
    syncRunning: Promise<void | SyncReturnValue> | null = null
    initValues: {
        isStarred: boolean
        tagsToAdd: string[]
        collectionsToAdd: string[]
    } = {} as any

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
            isStarred: false,
            tagsToAdd: [],
            collectionsToAdd: [],
            noteText: '',
            statusText: '',
        }
    }

    private handleSyncError(error: Error) {
        // Handle this differently as the default `handleSyncError` branch sends a system alert,
        //  which does not work in iOS extensions
        if (
            error.message.startsWith(
                `Could not find collection definition for '`,
            )
        ) {
            this.emitMutation({
                errorMessage: {
                    $set:
                        'Please update your app.\nSync is being attempted with a future version of the Memex extension',
                },
            })
            return
        }

        if (!handleSyncError(error, this.props as any).errorHandled) {
            this.emitMutation({ errorMessage: { $set: error.message } })
        }
    }

    private async doSync() {
        const { sync } = this.props.services

        if (this.syncRunning !== null) {
            // TODO: abort any running pull sync, do a push sync
            await this.syncRunning
        }

        sync.continuousSync.events.addListener('syncFinished', ({ error }) => {
            if (error) {
                this.handleSyncError(error)
            } else {
                this.clearSyncError()
            }

            sync.continuousSync.events.removeAllListeners('syncFinished')
        })

        this.syncRunning = sync.continuousSync.forceIncrementalSync()

        await this.syncRunning
        this.syncRunning = null
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        if (await shouldAutoSync(this.props.services)) {
            this.doSync()
        }

        let url: string

        try {
            url = await this.props.services.shareExt.getSharedUrl()
        } catch (err) {
            this.emitMutation({ isUnsupportedApplication: { $set: true } })
            return
        }

        this.emitMutation({ pageUrl: { $set: url } })

        const { overview, metaPicker } = this.props.storage.modules

        const isNewPage = (await overview.findPage({ url })) == null

        // No need to do state hydration from DB if this is new page, just index it
        if (isNewPage) {
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

    cleanup() {
        this.props.services.sync.continuousSync.events.removeAllListeners(
            'syncFinished',
        )
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

    async save(incoming: IncomingUIEvent<State, Event, 'save'>) {
        this.emitMutation({ showSavingPage: { $set: true } })
        await this.storePageFinal(incoming.previousState)

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
            url: state.pageUrl,
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
