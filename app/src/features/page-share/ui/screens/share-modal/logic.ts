// tslint:disable:no-console
import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { SyncReturnValue } from '@worldbrain/storex-sync'

import { MetaType, MetaTypeShape } from 'src/features/meta-picker/types'
import {
    UITaskState,
    UIServices,
    UIStorageModules,
    NavigationProps,
} from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { MOBILE_LIST_NAME } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/constants'
import { getMetaTypeName } from 'src/features/meta-picker/utils'

export interface State {
    loadState: UITaskState
    tagsState: UITaskState
    bookmarkState: UITaskState
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
    save: {}

    undoPageSave: {}
    metaPickerEntryPress: { entry: MetaTypeShape }
    setMetaViewType: { type?: MetaType }
    setModalVisible: { shown: boolean }
    togglePageStar: {}
    setNoteText: { value: string }

    toggleTag: { name: string }
    toggleCollection: { name: string }
    setPageUrl: { url: string }
    setPageStar: { value: boolean }
    setStatusText: { value: string }
    setCollectionsToAdd: { values: string[] }
}>

export interface Props extends NavigationProps {
    services: UIServices<'sync' | 'shareExt' | 'errorTracker' | 'localStorage'>
    storage: UIStorageModules<'overview' | 'metaPicker' | 'pageEditor'>
}

export default class Logic extends UILogic<State, Event> {
    syncRunning: Promise<void | SyncReturnValue> = Promise.resolve()
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

    private async doSync() {
        const { sync } = this.props.services

        if (this.syncRunning) {
            // TODO: abort any running pull sync, do a push sync
            await this.syncRunning
        }

        sync.continuousSync.events.addListener('syncFinished', ({ error }) => {
            if (error) {
                this.props.services.errorTracker.track(error)
                this.emitMutation({ errorMessage: { $set: error.message } })
            }

            sync.continuousSync.events.removeAllListeners('syncFinished')
        })
        this.syncRunning = sync.continuousSync.forceIncrementalSync()

        return this.syncRunning
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

        const pageP = loadInitial<State>(this, async () => {
            await this.storePageInit({ pageUrl: url } as State)
        })

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
                const tagsToAdd = tags.map(tag => tag.name)

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
                const collectionsToAdd = collections.map(c => c.name)

                this.emitMutation({
                    collectionsToAdd: {
                        $set: collectionsToAdd,
                    },
                })
                this.initValues.collectionsToAdd = collectionsToAdd
            },
        )

        await Promise.all([pageP, bookmarkP, tagsP, listsP])
    }

    cleanup() {
        this.props.services.sync.continuousSync.events.removeAllListeners(
            'syncFinished',
        )
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
            tagsToAdd: state => {
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
            collectionsToAdd: state => {
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
            await overview.deletePage({ url: incoming.previousState.pageUrl })
        } catch (err) {
        } finally {
            this.emitMutation({ isModalShown: { $set: false } })
        }
    }

    async save(incoming: IncomingUIEvent<State, Event, 'save'>) {
        this.emitMutation({ showSavingPage: { $set: true } })
        await this.storePageFinal(incoming.previousState)
        await this.doSync()
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

        if ((await overview.findPage({ url: state.pageUrl })) != null) {
            return
        }

        await overview.createPage({
            url: state.pageUrl,
            fullUrl: state.pageUrl,
            text: '',
            fullTitle: '',
        })

        await overview.visitPage({ url: state.pageUrl })

        await metaPicker.createMobileListIfAbsent()
        await metaPicker.setPageLists({
            url: state.pageUrl,
            lists: [MOBILE_LIST_NAME],
        })
    }

    private async storePageFinal(state: State, customTimestamp?: number) {
        const { overview, metaPicker, pageEditor } = this.props.storage.modules

        await overview.setPageStar({
            url: state.pageUrl,
            isStarred: state.isStarred,
        })

        await metaPicker.setPageLists({
            url: state.pageUrl,
            lists: [...state.collectionsToAdd, MOBILE_LIST_NAME],
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
