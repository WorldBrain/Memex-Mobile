import {
    UILogic,
    UIEvent,
    IncomingUIEvent,
    UIMutation,
    UIEventHandler,
} from 'ui-logic-core'
import { AppStateStatic, AppStateStatus, Linking } from 'react-native'

import { storageKeys } from '../../../../../../app.json'
import { UIPageWithNotes as UIPage, UINote } from 'src/features/overview/types'
import {
    UITaskState,
    UIStorageModules,
    UIServices,
    MainNavProps,
} from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { SPECIAL_LIST_IDS } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import { ListEntry } from 'src/features/meta-picker/types'
import { timeFromNow } from 'src/utils/time-helpers'
import { isSyncEnabled, handleSyncError } from 'src/features/sync/utils'
import { MainNavigatorParamList } from 'src/ui/navigation/types'
import type { List } from 'src/features/meta-picker/types'
import { ALL_SAVED_FILTER_ID, ALL_SAVED_FILTER_NAME } from './constants'
import {
    NormalizedState,
    initNormalizedState,
    normalizedStateToArray,
} from '@worldbrain/memex-common/lib/common-ui/utils/normalized-state'
import { getFeedUrl } from '@worldbrain/memex-common/lib/content-sharing/utils'

export interface State {
    syncState: UITaskState
    loadState: UITaskState
    reloadState: UITaskState
    loadMoreState: UITaskState
    listNameLoadState: UITaskState
    couldHaveMore: boolean
    shouldShowSyncRibbon: boolean
    pages: NormalizedState<UIPage>
    selectedListId: number | undefined
    action?: 'delete' | 'togglePageStar'
    actionState: UITaskState
    actionFinishedAt: number
    listData: { [listId: number]: List }
    showFeed: boolean
    resultsExhausted: boolean
}

export type Event = UIEvent<{
    maybeOpenFeed: null
    setSyncRibbonShow: { show: boolean }
    reload: { initListId?: number; triggerSync?: boolean }
    loadMore: {}
    setPages: { pages: UIPage[] }
    updatePage: { page: UIPage }
    deletePage: { url: string }
    togglePageStar: { url: string }
    toggleResultPress: { url: string }
    setFilteredListId: { id: number }
    shareSelectedList: { remoteListId: string }
    focusFromNavigation: MainNavigatorParamList['Dashboard']
    toggleFeed: null
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends MainNavProps<'Dashboard'> {
    appState: AppStateStatic
    storage: UIStorageModules<'metaPicker' | 'overview' | 'pageEditor'>
    services: UIServices<
        | 'cloudSync'
        | 'localStorage'
        | 'syncStorage'
        | 'errorTracker'
        | 'actionSheet'
        | 'listSharing'
        | 'listKeys'
        | 'activityIndicator'
    >
    getNow?: () => number
    pageSize?: number
}

type PageLookupEntryLoader = (prevState: State) => Promise<PageLookupEntry[]>

interface PageLookupEntry {
    url: string
    date: Date
}

export default class Logic extends UILogic<State, Event> {
    private removeAppChangeListener!: () => void
    private pageSize: number
    getNow: () => number

    constructor(private props: Props) {
        super()

        this.pageSize = props.pageSize || 15
        this.getNow = props.getNow || (() => Date.now())
    }

    getInitialState(initListId?: number): State {
        const { params } = this.props.route

        const selectedListId =
            initListId ?? params?.selectedListId ?? ALL_SAVED_FILTER_ID

        return {
            syncState: 'pristine',
            loadState: 'pristine',
            reloadState: 'running',
            loadMoreState: 'pristine',
            listNameLoadState: 'pristine',
            couldHaveMore: true,
            actionState: 'pristine',
            shouldShowSyncRibbon: false,
            actionFinishedAt: 0,
            pages: initNormalizedState(),
            selectedListId,
            listData: {},
            showFeed: false,
            resultsExhausted: false,
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        const { services, navigation, route } = this.props

        if (route.params?.openFeed != null) {
            await this.openMemexFeed()
        }

        // Nav to onboarding early if local storage flag is set
        const showOnboarding = await services.localStorage.get(
            storageKeys.showOnboarding,
        )
        if (showOnboarding) {
            navigation.navigate('Onboarding')
            return
        }

        // Nav to sync to do reprospective sync if needed (annotation spaces support feature)
        // NOTE: retro sync flag should be set post-init sync, so this will only trigger for
        //   existing users who did init-sync in earlier versions (where it didn't set that flag)
        const initSyncDone = await services.localStorage.get(
            storageKeys.initSyncFlag,
        )
        const retrospectiveSyncDone = await services.localStorage.get(
            storageKeys.retroSyncFlag,
        )
        if (initSyncDone && !retrospectiveSyncDone) {
            navigation.navigate('CloudSync', { shouldRetrospectiveSync: true })
            return
        }

        const handleAppStatusChange = (nextState: AppStateStatus) => {
            switch (nextState) {
                case 'active':
                    return this.processUIEvent('reload', {
                        ...incoming,
                        event: {
                            initListId: incoming.previousState.selectedListId,
                            triggerSync: true,
                        },
                    })
                default:
                    return
            }
        }

        this.props.appState.addEventListener('change', handleAppStatusChange)

        this.removeAppChangeListener = () =>
            this.props.appState.removeEventListener(
                'change',
                handleAppStatusChange,
            )

        if (incoming.previousState.selectedListId != null) {
            await this.fetchAndSetListName(
                incoming.previousState.selectedListId,
            )
        }

        await Promise.all([
            this.doSync(),
            loadInitial<State>(this, async () => {
                await this.doLoadMore(this.getInitialState())
            }),
        ])
        this.emitMutation({ reloadState: { $set: 'pristine' } })
    }

    cleanup() {
        if (this.removeAppChangeListener) {
            this.removeAppChangeListener()
        }
    }

    async focusFromNavigation({
        event,
        previousState,
    }: IncomingUIEvent<State, Event, 'focusFromNavigation'>) {
        if (
            !event?.selectedListId ||
            event.selectedListId === previousState.selectedListId
        ) {
            return
        }

        this.emitMutation({
            reloadState: { $set: 'running' },
            selectedListId: { $set: undefined },
        })
        await this.fetchAndSetListName(event.selectedListId)

        await executeUITask<State, 'reloadState', void>(
            this,
            'reloadState',
            async () =>
                this.doLoadMore(this.getInitialState(event.selectedListId)),
        )
    }

    private async doSync() {
        const { cloudSync } = this.props.services

        await executeUITask<State, 'syncState'>(this, 'syncState', async () => {
            try {
                const { totalChanges } = await cloudSync.sync()
                if (totalChanges > 0) {
                    this.emitMutation({
                        shouldShowSyncRibbon: { $set: true },
                    })
                }
            } catch (err) {
                handleSyncError(err, this.props)
            }
        })
    }

    setSyncRibbonShow(
        incoming: IncomingUIEvent<State, Event, 'setSyncRibbonShow'>,
    ): UIMutation<State> {
        return { shouldShowSyncRibbon: { $set: incoming.event.show } }
    }

    async setFilteredListId(
        incoming: IncomingUIEvent<State, Event, 'setFilteredListId'>,
    ): Promise<void> {
        await this.fetchAndSetListName(incoming.event.id)
    }

    async toggleFeed(): Promise<void> {
        this.emitMutation({
            showFeed: { $set: true },
        })
    }

    private async fetchAndSetListName(listId: number) {
        const { metaPicker } = this.props.storage.modules

        await executeUITask<State, 'listNameLoadState', void>(
            this,
            'listNameLoadState',
            async () => {
                const selectedList =
                    listId === ALL_SAVED_FILTER_ID
                        ? ({
                              name: ALL_SAVED_FILTER_NAME,
                              id: ALL_SAVED_FILTER_ID,
                              createdAt: new Date(),
                          } as List)
                        : await metaPicker.findListById({
                              id: listId,
                              includeRemoteIds: true,
                          })

                if (selectedList == null) {
                    throw new Error('Selected list cannot be found')
                }

                this.emitMutation({
                    selectedListId: { $set: listId },
                    listData: { [listId]: { $set: selectedList } },
                })
            },
        )
    }

    async reload({ event }: IncomingUIEvent<State, Event, 'reload'>) {
        if (event.triggerSync && (await isSyncEnabled(this.props.services))) {
            this.doSync()
        }

        this.emitMutation({ showFeed: { $set: false } })

        await executeUITask<State, 'reloadState', void>(
            this,
            'reloadState',
            async () => {
                await this.doLoadMore(this.getInitialState(event.initListId))
            },
        )
    }

    async loadMore(incoming: IncomingUIEvent<State, Event, 'loadMore'>) {
        await executeUITask<State, 'loadMoreState', void>(
            this,
            'loadMoreState',
            async () => {
                await this.doLoadMore(incoming.previousState)
            },
        )
    }

    async doLoadMore(prevState: State) {
        let couldHaveMore = prevState.couldHaveMore
        if (!couldHaveMore) {
            return
        }

        let entries: PageLookupEntry[]
        const entryLoader = this.choosePageEntryLoader(prevState)

        try {
            entries = await entryLoader(prevState)
        } catch (err) {
            this.emitMutation({ couldHaveMore: { $set: false } })
            return
        }

        if (entries.length < this.pageSize) {
            couldHaveMore = false
        }

        const pages: UIPage[] = []

        for (const entry of entries) {
            try {
                const page = await this.lookupPageForEntry(entry)
                pages.push(page)
            } catch (err) {
                continue
            }
        }

        this.emitMutation({
            couldHaveMore: { $set: couldHaveMore },
            pages: {
                $set: initNormalizedState({
                    getId: (page) => page.url,
                    seedData: [
                        ...normalizedStateToArray(prevState.pages),
                        ...pages,
                    ],
                }),
            },
        })

        if (!couldHaveMore) {
            this.emitMutation({
                resultsExhausted: { $set: true },
                loadMoreState: { $set: 'done' },
            })
        } else {
            this.emitMutation({ resultsExhausted: { $set: false } })
        }
    }

    private choosePageEntryLoader({
        selectedListId,
    }: State): PageLookupEntryLoader {
        this.emitMutation({ showFeed: { $set: false } })
        if (selectedListId === ALL_SAVED_FILTER_ID) {
            return this.loadEntriesForVisits
        }

        return this.loadEntriesForCollection
    }

    private loadEntriesForCollection: PageLookupEntryLoader = async (
        prevState,
    ) => {
        const { metaPicker } = this.props.storage.modules

        let listEntries: ListEntry[] = await metaPicker.findRecentListEntries(
            prevState.selectedListId,
            {
                skip: prevState.pages.allIds.length,
                limit: this.pageSize,
            },
        )

        listEntries = listEntries.filter((entry) => !!entry.pageUrl)

        return listEntries.map((entry) => ({
            url: entry.pageUrl,
            date: entry.createdAt,
        }))
    }

    private loadEntriesForBookmarks: PageLookupEntryLoader = async (
        prevState,
    ) => {
        const { overview } = this.props.storage.modules

        const bookmarks = await overview.findLatestBookmarks({
            skip: prevState.pages.allIds.length,
            limit: this.pageSize,
        })

        return bookmarks.map((bm) => ({ url: bm.url, date: new Date(bm.time) }))
    }

    private loadEntriesForVisits: PageLookupEntryLoader = async (prevState) => {
        const { overview } = this.props.storage.modules

        const visits = await overview.findLatestVisitsByPage({
            skip: prevState.pages.allIds.length,
            limit: this.pageSize,
        })

        return visits.map((visit) => ({
            url: visit.url,
            date: new Date(visit.time),
        }))
    }

    private async lookupPageForEntry({
        url,
        date,
    }: PageLookupEntry): Promise<UIPage> {
        const { overview, metaPicker, pageEditor } = this.props.storage.modules

        const page = await overview.findPage({ url })
        if (!page) {
            throw Error('No page found for entry')
        }

        const lists = await metaPicker.findListsByPage({
            url,
            includeRemoteIds: true,
        })
        const notes = await pageEditor.findNotesByPage({ url })

        // Add any new lists data to state
        this.emitMutation({
            listData: {
                $apply: (existing) => ({
                    ...existing,
                    ...lists.reduce(
                        (acc, list) => ({ ...acc, [list.id]: list }),
                        {},
                    ),
                }),
            },
        })

        return {
            url,
            type: page.type,
            domain: page.domain,
            fullUrl: page.fullUrl,
            pageUrl: page.url,
            titleText: page.fullTitle || page.url,
            isStarred: !!page.isStarred,
            date: timeFromNow(date),
            tags: [],
            listIds: lists
                .filter(
                    (list) =>
                        ![
                            SPECIAL_LIST_IDS.INBOX,
                            SPECIAL_LIST_IDS.MOBILE,
                        ].includes(list.id),
                )
                .map((list) => list.id),
            notes: notes.map<UINote>((note) => ({
                domain: page!.domain,
                fullUrl: page!.url,
                url: note.url,
                isStarred: note.isStarred,
                commentText: note.comment || undefined,
                noteText: note.body,
                isNotePressed: false,
                tags: [],
                listIds: [],
                isEdited:
                    note.lastEdited?.getTime() !== note.createdWhen!.getTime(),
                date: timeFromNow(note.lastEdited ?? note.createdWhen!),
            })),
        }
    }

    setPages(
        incoming: IncomingUIEvent<State, Event, 'setPages'>,
    ): UIMutation<State> {
        const pageEntries = incoming.event.pages.map((page) => [
            page.url,
            page,
        ]) as [string, UIPage][]
        return {}
        // return { pages: { $set: new Map(pageEntries) } }
    }

    async updatePage({
        previousState,
        event: { page: next },
    }: IncomingUIEvent<State, Event, 'updatePage'>) {
        const trackedListIds = new Set(
            Object.keys(previousState.listData).map(Number),
        )
        let listIdsToTrack: number[] = []
        for (const incomingListId of next.listIds) {
            if (trackedListIds.has(incomingListId)) {
                continue
            }

            listIdsToTrack.push(incomingListId)
        }

        const mutation: UIMutation<State> = {}
        if (listIdsToTrack.length > 0) {
            const lists = await this.props.storage.modules.metaPicker.findListsByIds(
                {
                    ids: listIdsToTrack,
                    includeRemoteIds: true,
                },
            )
            mutation.listData = {
                $apply: (existing) => ({
                    ...existing,
                    ...lists.reduce(
                        (acc, list) => ({ ...acc, [list.id]: list }),
                        {},
                    ),
                }),
            }
        }

        this.emitMutation({
            ...mutation,
            pages: {
                byId: {
                    [next.url]: {
                        listIds: { $set: next.listIds },
                        notes: { $set: next.notes },
                    },
                },
            },
        })
    }

    async deletePage({
        event,
        previousState,
    }: IncomingUIEvent<State, Event, 'deletePage'>) {
        await executeUITask<State, 'actionState', void>(
            this,
            'actionState',
            async () => {
                this.emitMutation({
                    action: { $set: 'delete' },
                })
                try {
                    await this.props.storage.modules.overview.deletePage({
                        url: event.url,
                    })
                    this.emitMutation({
                        pages: {
                            byId: { $unset: [event.url] },
                            allIds: {
                                $set: previousState.pages.allIds.filter(
                                    (id) => id !== event.url,
                                ),
                            },
                        },
                    })
                } finally {
                    this.emitMutation({
                        actionFinishedAt: { $set: this.getNow() },
                    })
                }
            },
        )
    }

    async togglePageStar({
        event: { url },
        previousState: { pages },
    }: IncomingUIEvent<State, Event, 'togglePageStar'>) {
        await executeUITask<State, 'actionState', void>(
            this,
            'actionState',
            async () => {
                this.emitMutation({
                    action: { $set: 'togglePageStar' },
                })
                try {
                    // TODO: fix this if we ever bring it back
                    // const page = pages.get(url)!
                    // const isStarred = !page.isStarred
                    // await this.props.storage.modules.overview.setPageStar({
                    //     url,
                    //     isStarred,
                    // })
                    // this.emitMutation({
                    //     pages: (state) => {
                    //         const current = state.get(url)!
                    //         return state.set(url, { ...current, isStarred })
                    //     },
                    // })
                } finally {
                    this.emitMutation({
                        actionFinishedAt: { $set: this.getNow() },
                    })
                }
            },
        )
    }

    toggleResultPress({
        event,
    }: IncomingUIEvent<State, Event, 'toggleResultPress'>): UIMutation<State> {
        return {
            pages: {
                byId: {
                    [event.url]: {
                        isResultPressed: { $apply: (prev) => !prev },
                    },
                },
            },
            // pages: (state) => {
            //     const page = state.get(url)!
            //     return state.set(url, {
            //         ...page,
            //         isResultPressed: !page.isResultPressed,
            //     })
            // },
        }
    }

    private async openMemexFeed() {
        await Linking.openURL(getFeedUrl())
    }

    maybeOpenFeed: EventHandler<'maybeOpenFeed'> = async ({}) => {
        if (this.props.route.params?.openFeed != null) {
            await this.openMemexFeed()
        }
    }

    shareSelectedList: EventHandler<'shareSelectedList'> = ({
        previousState,
        event,
    }) => {
        if (previousState.selectedListId == null) {
            throw new Error('No list selected to share')
        }

        this.emitMutation({
            listData: {
                [previousState.selectedListId]: {
                    remoteId: { $set: event.remoteListId },
                },
            },
        })
    }
}

// export function shouldShowActionStatus(state: State, now?: number) {
//     const THRESHOLD = 1000 * 5
//     return (
//         state.actionState === 'running' ||
//         ((now || Date.now()) - state.deletingFinishedAt) <= THRESHOLD
//     )
// }
