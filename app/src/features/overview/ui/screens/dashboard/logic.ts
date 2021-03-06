import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { AppState, AppStateStatus } from 'react-native'

import { storageKeys } from '../../../../../../app.json'
import { UIPageWithNotes as UIPage, UINote } from 'src/features/overview/types'
import {
    UITaskState,
    UIStorageModules,
    UIServices,
    MainNavProps,
} from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { SPECIAL_LIST_NAMES } from '@worldbrain/memex-storage/lib/lists/constants'
import { ListEntry } from 'src/features/meta-picker/types'
import { timeFromNow } from 'src/utils/time-helpers'
import { TAGS_PER_RESULT_LIMIT } from './constants'
import {
    isSyncEnabled,
    shouldAutoSync,
    handleSyncError,
} from 'src/features/sync/utils'
import { MainNavigatorParamList } from 'src/ui/navigation/types'
import ListsFilter from '../lists-filter'

export interface State {
    syncState: UITaskState
    loadState: UITaskState
    reloadState: UITaskState
    loadMoreState: UITaskState
    couldHaveMore: boolean
    shouldShowSyncRibbon: boolean
    pages: Map<string, UIPage>
    selectedListName: string
    action?: 'delete' | 'togglePageStar'
    actionState: UITaskState
    actionFinishedAt: number
}

export type Event = UIEvent<{
    setSyncRibbonShow: { show: boolean }
    reload: { initList?: string; triggerSync?: boolean }
    loadMore: {}
    setPages: { pages: UIPage[] }
    updatePage: { page: UIPage }
    deletePage: { url: string }
    togglePageStar: { url: string }
    toggleResultPress: { url: string }
    setFilteredListName: { name: string }
    focusFromNavigation: MainNavigatorParamList['Dashboard']
}>

export interface Props extends MainNavProps<'Dashboard'> {
    storage: UIStorageModules<'metaPicker' | 'overview' | 'pageEditor'>
    services: UIServices<'sync' | 'localStorage' | 'errorTracker'>
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

    getInitialState(initList?: string): State {
        const { params } = this.props.route

        const selectedListName =
            initList ?? params?.selectedList ?? SPECIAL_LIST_NAMES.MOBILE

        return {
            syncState: 'pristine',
            loadState: 'pristine',
            reloadState: 'pristine',
            loadMoreState: 'pristine',
            couldHaveMore: true,
            actionState: 'pristine',
            shouldShowSyncRibbon: false,
            actionFinishedAt: 0,
            pages: new Map(),
            selectedListName,
        }
    }

    private async navToOnboardingIfNeeded() {
        const showOnboarding = await this.props.services.localStorage.get<
            boolean
        >(storageKeys.showOnboarding)

        if (showOnboarding || showOnboarding === null) {
            this.props.navigation.navigate('Onboarding')
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        await this.navToOnboardingIfNeeded()

        const handleAppStatusChange = (nextState: AppStateStatus) => {
            switch (nextState) {
                case 'active':
                    return this.processUIEvent('reload', {
                        ...incoming,
                        event: {
                            initList: incoming.previousState.selectedListName,
                            triggerSync: true,
                        },
                    })
                default:
                    return
            }
        }

        AppState.addEventListener('change', handleAppStatusChange)

        this.removeAppChangeListener = () =>
            AppState.removeEventListener('change', handleAppStatusChange)

        if (await shouldAutoSync(this.props.services)) {
            this.doSync()
        }

        await loadInitial<State>(this, async () => {
            await this.doLoadMore(this.getInitialState())
        })
    }

    cleanup() {
        if (this.removeAppChangeListener) {
            this.removeAppChangeListener()
        }

        this.props.services.sync.continuousSync.events.removeAllListeners(
            'syncFinished',
        )
    }

    async focusFromNavigation({
        event,
        previousState,
    }: IncomingUIEvent<State, Event, 'focusFromNavigation'>) {
        if (
            !event?.selectedList ||
            event.selectedList === previousState.selectedListName
        ) {
            return
        }

        // While this.emitMutation is NOT async, if you remove this await then the state update doesn't happen somehow :S
        // Please don't remove the await!
        // TODO: find cause of this bug in `ui-logic-core` lib
        await this.emitMutation({
            selectedListName: { $set: event.selectedList },
        })

        await executeUITask<State, 'reloadState', void>(
            this,
            'reloadState',
            async () =>
                this.doLoadMore(this.getInitialState(event.selectedList)),
        )
    }

    private async doSync() {
        const { sync } = this.props.services

        sync.continuousSync.events.addListener(
            'syncFinished',
            ({ hasChanges, error }) => {
                if (error) {
                    handleSyncError(error, this.props)
                }

                if (hasChanges) {
                    this.emitMutation({
                        shouldShowSyncRibbon: { $set: true },
                    })
                }

                sync.continuousSync.events.removeAllListeners('syncFinished')
            },
        )

        await executeUITask<State, 'syncState', void>(
            this,
            'syncState',
            async () => {
                await sync.continuousSync
                    .maybeDoIncrementalSync()
                    .catch((err) => this.props.services.errorTracker.track(err))
            },
        )
    }

    setSyncRibbonShow(
        incoming: IncomingUIEvent<State, Event, 'setSyncRibbonShow'>,
    ): UIMutation<State> {
        return { shouldShowSyncRibbon: { $set: incoming.event.show } }
    }

    setFilteredListName(
        incoming: IncomingUIEvent<State, Event, 'setFilteredListName'>,
    ): UIMutation<State> {
        return {
            selectedListName: { $set: incoming.event.name },
        }
    }

    async reload({ event }: IncomingUIEvent<State, Event, 'reload'>) {
        if (event.triggerSync && (await isSyncEnabled(this.props.services))) {
            this.doSync()
        }

        await executeUITask<State, 'reloadState', void>(
            this,
            'reloadState',
            async () => {
                await this.doLoadMore(this.getInitialState(event.initList))
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
        selectedListName,
    }: State): PageLookupEntryLoader {
        if (selectedListName === ListsFilter.MAGIC_BMS_FILTER) {
            return this.loadEntriesForBookmarks
        } else if (selectedListName === ListsFilter.MAGIC_VISITS_FILTER) {
            return this.loadEntriesForVisits
        }

        return this.loadEntriesForCollection
    }

    private loadEntriesForCollection: PageLookupEntryLoader = async (
        prevState,
    ) => {
        const { metaPicker } = this.props.storage.modules

        const selectedLists = await metaPicker.findListsByNames({
            names: [prevState.selectedListName],
        })

        if (!selectedLists.length) {
            throw new Error('Selected lists cannot be found')
        }

        let listEntries: ListEntry[] = await metaPicker.findRecentListEntries(
            selectedLists[0].id,
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
        const tags = await metaPicker.findTagsByPage({
            url,
            limit: TAGS_PER_RESULT_LIMIT,
        })

        return {
            url,
            domain: page.domain,
            fullUrl: page.fullUrl,
            pageUrl: page.url,
            titleText: page.fullTitle || page.url,
            isStarred: !!page.isStarred,
            date: timeFromNow(date),
            tags: tags.map((tag) => tag.name),
            lists: lists.map((list) => list.name),
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

    updatePage({
        event: { page: next },
    }: IncomingUIEvent<State, Event, 'updatePage'>) {
        this.emitMutation({
            pages: {
                $apply: (pages) => {
                    const existingPage = pages.get(next.url)

                    if (!existingPage) {
                        throw new Error(
                            'No existing page found in dashboard state to update',
                        )
                    }

                    return pages.set(next.url, {
                        ...existingPage,
                        tags: next.tags,
                        lists: next.lists,
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
