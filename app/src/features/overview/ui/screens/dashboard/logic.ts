import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { AppStateStatic, AppStateStatus } from 'react-native'

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
import { ALL_SAVED_FILTER_ID } from './constants'

export interface State {
    syncState: UITaskState
    loadState: UITaskState
    reloadState: UITaskState
    loadMoreState: UITaskState
    listNameLoadState: UITaskState
    couldHaveMore: boolean
    shouldShowSyncRibbon: boolean
    pages: Map<string, UIPage>
    selectedListId: number
    selectedListName: string | null
    action?: 'delete' | 'togglePageStar'
    actionState: UITaskState
    actionFinishedAt: number
    listsData: { [listId: number]: List }
}

export type Event = UIEvent<{
    setSyncRibbonShow: { show: boolean }
    reload: { initListId?: number; triggerSync?: boolean }
    loadMore: {}
    setPages: { pages: UIPage[] }
    updatePage: { page: UIPage }
    deletePage: { url: string }
    togglePageStar: { url: string }
    toggleResultPress: { url: string }
    setFilteredListId: { id: number }
    focusFromNavigation: MainNavigatorParamList['Dashboard']
}>

export interface Props extends MainNavProps<'Dashboard'> {
    appState: AppStateStatic
    storage: UIStorageModules<'metaPicker' | 'overview' | 'pageEditor'>
    services: UIServices<
        'cloudSync' | 'localStorage' | 'syncStorage' | 'errorTracker'
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
            initListId ?? params?.selectedListId ?? SPECIAL_LIST_IDS.MOBILE

        return {
            syncState: 'pristine',
            loadState: 'pristine',
            reloadState: 'pristine',
            loadMoreState: 'pristine',
            listNameLoadState: 'pristine',
            couldHaveMore: true,
            selectedListName: null,
            actionState: 'pristine',
            shouldShowSyncRibbon: false,
            actionFinishedAt: 0,
            pages: new Map(),
            selectedListId,
            listsData: {},
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        const {
            navigation,
            services: { localStorage },
        } = this.props

        // Nav to onboarding early if local storage flag is set
        const showOnboarding = await localStorage.get(
            storageKeys.showOnboarding,
        )
        if (showOnboarding) {
            navigation.navigate('Onboarding')
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

        await this.fetchAndSetListName(event.selectedListId)
        // const list = await metaPicker.findListById({ id: event.selectedListId })

        // // While this.emitMutation is NOT async, if you remove this await then the state update doesn't happen somehow :S
        // // Please don't remove the await!
        // // TODO: find cause of this bug in `ui-logic-core` lib
        // await this.emitMutation({
        //     selectedListId: { $set: event.selectedListId },
        //     selectedListName: { $set: list?.name ?? '' }
        // })

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

    async fetchAndSetListName(listId: number) {
        const { metaPicker } = this.props.storage.modules
        await executeUITask<State, 'listNameLoadState', void>(
            this,
            'listNameLoadState',
            async () => {
                const selectedList =
                    listId === ALL_SAVED_FILTER_ID
                        ? { name: 'All Saved' }
                        : await metaPicker.findListById({
                              id: listId,
                          })
                this.emitMutation({
                    selectedListName: { $set: selectedList?.name ?? '' },
                    selectedListId: { $set: listId },
                })
            },
        )
    }

    async reload({ event }: IncomingUIEvent<State, Event, 'reload'>) {
        if (event.triggerSync && (await isSyncEnabled(this.props.services))) {
            this.doSync()
        }

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

        const pages: Array<[string, UIPage]> = []

        for (const entry of entries) {
            try {
                const page = await this.lookupPageForEntry(entry)
                pages.push([entry.url, page])
            } catch (err) {
                continue
            }
        }

        this.emitMutation({
            couldHaveMore: { $set: couldHaveMore },
            pages: {
                $set: new Map<string, UIPage>([
                    ...prevState.pages.entries(),
                    ...pages,
                ]),
            },
        })
    }

    private choosePageEntryLoader({
        selectedListId,
    }: State): PageLookupEntryLoader {
        if (selectedListId === ALL_SAVED_FILTER_ID) {
            return this.loadEntriesForVisits
        }

        return this.loadEntriesForCollection
    }

    private loadEntriesForCollection: PageLookupEntryLoader = async (
        prevState,
    ) => {
        const { metaPicker } = this.props.storage.modules

        const selectedList = await metaPicker.findListById({
            id: prevState.selectedListId,
        })

        if (!selectedList) {
            throw new Error('Selected list cannot be found')
        }

        let listEntries: ListEntry[] = await metaPicker.findRecentListEntries(
            selectedList.id,
            {
                skip: prevState.pages.size,
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
            skip: prevState.pages.size,
            limit: this.pageSize,
        })

        return bookmarks.map((bm) => ({ url: bm.url, date: new Date(bm.time) }))
    }

    private loadEntriesForVisits: PageLookupEntryLoader = async (prevState) => {
        const { overview } = this.props.storage.modules

        const visits = await overview.findLatestVisitsByPage({
            skip: prevState.pages.size,
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

        const lists = await metaPicker.findListsByPage({ url })
        const notes = await pageEditor.findNotes({ url })

        // Add any new lists data to state
        this.emitMutation({
            listsData: {
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
        return { pages: { $set: new Map(pageEntries) } }
    }

    async updatePage({
        previousState,
        event: { page: next },
    }: IncomingUIEvent<State, Event, 'updatePage'>) {
        const trackedListIds = new Set(
            Object.keys(previousState.listsData).map(Number),
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
            const lists =
                await this.props.storage.modules.metaPicker.findListsByIds({
                    ids: listIdsToTrack,
                })
            mutation.listsData = {
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
                $apply: (pages: State['pages']) => {
                    const existingPage = pages.get(next.url)

                    if (!existingPage) {
                        throw new Error(
                            'No existing page found in dashboard state to update',
                        )
                    }

                    return pages.set(next.url, {
                        ...existingPage,
                        tags: next.tags,
                        listIds: next.listIds,
                        notes: next.notes,
                    })
                },
            },
        })
    }

    async deletePage(incoming: IncomingUIEvent<State, Event, 'deletePage'>) {
        await executeUITask<State, 'actionState', void>(
            this,
            'actionState',
            async () => {
                this.emitMutation({
                    action: { $set: 'delete' },
                })
                try {
                    await this.props.storage.modules.overview.deletePage({
                        url: incoming.event.url,
                    })
                    this.emitMutation({
                        pages: (state) => {
                            state.delete(incoming.event.url)
                            return state
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
                    const page = pages.get(url)!
                    const isStarred = !page.isStarred
                    await this.props.storage.modules.overview.setPageStar({
                        url,
                        isStarred,
                    })
                    this.emitMutation({
                        pages: (state) => {
                            const current = state.get(url)!
                            return state.set(url, { ...current, isStarred })
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

    toggleResultPress({
        event: { url },
    }: IncomingUIEvent<State, Event, 'toggleResultPress'>): UIMutation<State> {
        return {
            pages: (state) => {
                const page = state.get(url)!
                return state.set(url, {
                    ...page,
                    isResultPressed: !page.isResultPressed,
                })
            },
        }
    }
}

// export function shouldShowActionStatus(state: State, now?: number) {
//     const THRESHOLD = 1000 * 5
//     return (
//         state.actionState === 'running' ||
//         ((now || Date.now()) - state.deletingFinishedAt) <= THRESHOLD
//     )
// }
