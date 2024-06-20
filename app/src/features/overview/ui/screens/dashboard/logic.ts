import {
    UILogic,
    UIEvent,
    IncomingUIEvent,
    UIMutation,
    UIEventHandler,
} from 'ui-logic-core'
import {
    Alert,
    AppStateStatic,
    AppStateStatus,
    Linking,
    Platform,
    Share,
} from 'react-native'
import debounce from 'lodash/debounce'
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
import { handleSyncError } from 'src/features/sync/utils'
import { MainNavigatorParamList } from 'src/ui/navigation/types'
import type { List } from 'src/features/meta-picker/types'
import { ALL_SAVED_FILTER_ID, ALL_SAVED_FILTER_NAME } from './constants'
import {
    NormalizedState,
    initNormalizedState,
    normalizedStateToArray,
} from '@worldbrain/memex-common/lib/common-ui/utils/normalized-state'
import { getFeedUrl } from '@worldbrain/memex-common/lib/content-sharing/utils'
import { Copy, Trash } from 'src/ui/components/icons/icons-list'
import { normalizeUrl } from '@worldbrain/memex-common/lib/url-utils/normalize'
import { CITATIONS_FEATURE_BUG_FIX_RELEASE } from 'src/services/cloud-sync/constants'
import {
    splitQueryIntoTerms,
    unifiedTermsSearch,
} from '@worldbrain/memex-common/lib/search/terms-search'
import { queryPages, queryAnnotations } from 'src/storage/fts'
import type StorageManager from '@worldbrain/storex'
import type { AuthenticatedUser } from '@worldbrain/memex-common/lib/authentication/types'

export interface State {
    currentUser: AuthenticatedUser | null
    syncState: UITaskState
    loadState: UITaskState
    reloadState: UITaskState
    loadMoreState: UITaskState
    listNameLoadState: UITaskState
    shouldShowSyncRibbon: boolean
    shouldShowRetroSyncNotif: boolean
    pages: NormalizedState<UIPage>
    selectedListId: number
    action?: 'delete' | 'togglePageStar'
    actionState: UITaskState
    actionFinishedAt: number
    listData: { [listId: number]: List }
    showFeed: boolean
    resultsExhausted: boolean
    totalDownloads: number
    downloadProgress: number
    searchQuery: string
    showNotes: boolean
}

export type Event = UIEvent<{
    maybeOpenFeed: null
    setSyncRibbonShow: { show: boolean }
    reload: { initListId?: number; triggerSync?: boolean }
    loadMore: {}
    setSearchQuery: { query: string }
    setPages: { pages: UIPage[] }
    updatePage: { page: UIPage }
    deletePage: { url: string }
    togglePageStar: { url: string }
    toggleResultPress: { fullUrl: string }
    setFilteredListId: { id: number; skipSelectedListSet: boolean }
    shareSelectedList: { remoteListId: string }
    focusFromNavigation: MainNavigatorParamList['Dashboard']
    performRetroSyncToDLMissingChanges: null
    toggleFeed: null
    setAnnotationToEdit: {
        pageId: string
        annotId: string
        showSpacePicker?: boolean
    }
    confirmNoteDelete: { pageId: string; annotId: string }
    toggleNotes: null
}>

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface Props extends MainNavProps<'Dashboard'> {
    appState: AppStateStatic
    storage: UIStorageModules<'metaPicker' | 'overview' | 'pageEditor'>
    storageManager: StorageManager
    services: UIServices<
        | 'cloudSync'
        | 'localStorage'
        | 'syncStorage'
        | 'errorTracker'
        | 'actionSheet'
        | 'listSharing'
        | 'listKeys'
        | 'activityIndicator'
        | 'keepAwake'
        | 'annotationSharing'
        | 'auth'
    >
    getNow?: () => number
    pageSize?: number
}

type PageLookupEntryLoader = (prevState: State) => Promise<PageLookupEntry[]>

interface PageLookupEntry {
    url: string
    date: Date
    /** Fill this in to only look up certain annotations for this entry, instead of all. */
    specificAnnotationIds?: string[]
}

export default class Logic extends UILogic<State, Event> {
    private removeAppChangeListener!: () => void
    private pageSize: number
    getNow: () => number

    constructor(private props: Props) {
        super()

        this.pageSize = props.pageSize ?? 10
        this.getNow = props.getNow ?? (() => Date.now())
    }

    getInitialState(initListId?: number): State {
        const { params } = this.props.route

        const selectedListId =
            initListId ?? params?.selectedListId ?? ALL_SAVED_FILTER_ID

        return {
            currentUser: null,
            syncState: 'pristine',
            loadState: 'pristine',
            reloadState: 'running',
            loadMoreState: 'pristine',
            listNameLoadState: 'pristine',
            actionState: 'pristine',
            searchQuery: '',
            shouldShowSyncRibbon: false,
            shouldShowRetroSyncNotif: false,
            actionFinishedAt: 0,
            pages: initNormalizedState(),
            selectedListId,
            listData: {},
            showFeed: false,
            resultsExhausted: false,
            downloadProgress: 0,
            totalDownloads: 0,
            showNotes: true,
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

        const handleAppStatusChange = (nextState: AppStateStatus) => {
            switch (nextState) {
                case 'active':
                // return this.processUIEvent('reload', {
                //     ...incoming,
                //     event: {
                //         initListId: incoming.previousState.selectedListId,
                //         triggerSync: true,
                //     },
                // })
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

        await loadInitial<State>(this, async () => {
            await this.doLoadMore(this.getInitialState())

            // Commented out for reuse but for now we dont need it.

            // const retroSyncProcessedTime =
            //     (await services.localStorage.get(
            //         storageKeys.retroSyncLastProcessedTime,
            //     )) ?? 0
            this.emitMutation({
                reloadState: { $set: 'pristine' }, // TODO: Why is this being set here?
                // shouldShowRetroSyncNotif: {
                //     $set:
                //         retroSyncProcessedTime <
                //         CITATIONS_FEATURE_BUG_FIX_RELEASE,
                // },
            })
        })

        services.cloudSync.events.addListener(
            'syncStatsChanged',
            ({ stats }) => {
                if (stats.totalDownloads === stats.downloadProgress) {
                    this.emitMutation({
                        downloadProgress: { $set: 0 },
                        // This should only set it the first time
                        totalDownloads: {
                            $set: 0,
                        },
                    })
                    this.emitMutation({
                        shouldShowSyncRibbon: { $set: true },
                    })
                } else {
                    this.emitMutation({
                        downloadProgress: {
                            $apply: (prev) =>
                                (prev ?? 0) + stats.downloadProgress,
                        },
                        // This should only set it the first time
                        totalDownloads: {
                            $set: stats.totalDownloads,
                        },
                    })
                }
            },
        )

        await this.doSync()
        const currentUser = await this.props.services.auth.getCurrentUser()
        this.emitMutation({ currentUser: { $set: currentUser } })
    }

    cleanup() {
        if (this.removeAppChangeListener) {
            this.removeAppChangeListener()
        }
    }

    setAnnotationToEdit: EventHandler<'setAnnotationToEdit'> = async ({
        event,
        previousState,
    }) => {
        let page = previousState.pages.byId[event.pageId]
        if (!page) {
            throw new Error(
                `Page not found to edit annotation for: ${event.pageId}`,
            )
        }
        let annot = page.notes.find((n) => n.url === event.annotId)
        if (!annot) {
            throw new Error(`Annotation not found to edit: ${event.annotId}`)
        }
        let { listData } = previousState

        this.props.navigation.navigate('NoteEditor', {
            spaces: annot.listIds.map((id) => ({
                id,
                name: listData[id]?.name ?? 'Missing Space',
                remoteId: listData[id]?.remoteId,
            })),
            privacyLevel: annot.privacyLevel,
            highlightText: annot.noteText,
            noteText: annot.commentText,
            noteUrl: annot.url,
            mode: 'update',
            showSpacePicker: event.showSpacePicker,
            updateAnnotation: (nextComment, nextListIds) =>
                this.updateNoteComment(
                    event.pageId,
                    event.annotId,
                    nextComment,
                    nextListIds,
                ),
        })
    }

    private updateNoteComment = (
        pageId: string,
        annotId: string,
        nextComment: string,
        nextListIds: number[],
    ) => {
        this.emitMutation({
            pages: {
                byId: {
                    [pageId]: {
                        $apply: (page) => {
                            const idx = page.notes.findIndex(
                                (n) => n.url === annotId,
                            )
                            if (idx === -1) {
                                return page
                            }
                            return {
                                ...page,
                                notes: [
                                    ...page.notes.slice(0, idx),
                                    {
                                        ...page.notes[idx],
                                        commentText: nextComment,
                                        listIds: nextListIds,
                                    },
                                    ...page.notes.slice(idx + 1),
                                ],
                            }
                        },
                    },
                },
            },
        })
    }

    confirmNoteDelete: EventHandler<'confirmNoteDelete'> = ({ event }) => {
        const deleteAnnotation = async () => {
            this.emitMutation({
                pages: {
                    byId: {
                        [event.pageId]: {
                            notes: {
                                $apply: (notes: UINote[]) =>
                                    notes.filter(
                                        (note) => note.url !== event.annotId,
                                    ),
                            },
                        },
                    },
                },
            })

            await this.props.storage.modules.pageEditor.deleteNoteByUrl({
                url: event.annotId,
            })
        }
        Alert.alert('Delete Note?', `You cannot get this back`, [
            { text: 'Delete', onPress: deleteAnnotation },
            { text: 'Cancel' },
        ])
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

        let state = this.getInitialState(event.selectedListId)
        state.searchQuery = previousState.searchQuery

        await executeUITask<State, 'reloadState', void>(
            this,
            'reloadState',
            async () => this.doLoadMore(state),
        )
    }

    private async doSync() {
        const { cloudSync, keepAwake } = this.props.services

        keepAwake.activate()

        let syncChanges = 0
        await executeUITask<State, 'syncState'>(this, 'syncState', async () => {
            try {
                await cloudSync.syncStream()
            } catch (err) {
                handleSyncError(err, this.props)
            } finally {
                keepAwake.deactivate()
            }
        })

        if (syncChanges > 0) {
            this.emitMutation({
                shouldShowSyncRibbon: { $set: true },
            })
        }
    }

    setSyncRibbonShow(
        incoming: IncomingUIEvent<State, Event, 'setSyncRibbonShow'>,
    ): UIMutation<State> {
        return { shouldShowSyncRibbon: { $set: incoming.event.show } }
    }

    async setFilteredListId(
        incoming: IncomingUIEvent<State, Event, 'setFilteredListId'>,
    ): Promise<void> {
        await this.fetchAndSetListName(
            incoming.event.id,
            incoming.event.skipSelectedListSet,
        )
    }

    async toggleFeed(): Promise<void> {
        this.emitMutation({
            showFeed: { $set: true },
        })
    }

    private async fetchAndSetListName(
        listId: number,
        skipSelectedListSet?: boolean,
        previousState?: State,
        fetchResults?: boolean,
    ) {
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
                let mutation: UIMutation<State> = {
                    selectedListId: { $set: listId },
                    listData: { [listId]: { $set: selectedList } },
                }
                if (skipSelectedListSet) {
                    delete mutation['selectedListId']
                }

                this.emitMutation(mutation)
            },
        )
    }

    async reload({
        event,
        previousState,
    }: IncomingUIEvent<State, Event, 'reload'>) {
        if (event.triggerSync) {
            this.doSync()
        }

        this.emitMutation({ showFeed: { $set: false } })

        await executeUITask<State, 'reloadState', void>(
            this,
            'reloadState',
            async () => {
                const state = this.getInitialState(event.initListId)
                if (previousState.searchQuery) {
                    state.searchQuery = previousState.searchQuery
                }

                await this.doLoadMore(state)
            },
        )
    }

    async loadMore(incoming: IncomingUIEvent<State, Event, 'loadMore'>) {
        await executeUITask<State, 'loadMoreState', void>(
            this,
            'loadMoreState',
            async () => {
                await this.doLoadMore(incoming.previousState, true)
            },
        )
    }

    private async doLoadMore(prevState: State, shouldPaginate?: boolean) {
        let resultsExhausted = prevState.resultsExhausted
        let isTermsSearch = prevState.searchQuery.trim().length > 0
        let entries: PageLookupEntry[]
        let pages: UIPage[] = []

        if (isTermsSearch) {
            // This is the newer terms search logic, shared with extension
            let queryAnalysis = splitQueryIntoTerms(prevState.searchQuery)
            let results = await unifiedTermsSearch({
                storageManager: this.props.storageManager,
                queryPages: queryPages(this.props.storageManager),
                queryAnnotations: queryAnnotations(this.props.storageManager),
                filterByDomains: [],
                filterByListIds:
                    prevState.selectedListId !== ALL_SAVED_FILTER_ID
                        ? [prevState.selectedListId]
                        : [],
                matchPageTitleUrl: queryAnalysis.inTitle,
                matchPageText: queryAnalysis.inContent,
                matchNotes: queryAnalysis.inComment,
                matchHighlights: queryAnalysis.inHighlight,
                phrases: queryAnalysis.phrases,
                terms: queryAnalysis.terms,
                matchTermsFuzzyStartsWith:
                    queryAnalysis.matchTermsFuzzyStartsWith,
                query: prevState.searchQuery,
                limit: this.pageSize,
                skip: shouldPaginate ? prevState.pages.allIds.length : 0,
            })

            entries = [...results.resultDataByPage.entries()].map(
                ([pageUrl, { latestPageTimestamp, annotations }]) => ({
                    url: pageUrl,
                    date: new Date(latestPageTimestamp),
                    specificAnnotationIds: annotations.map((a) => a.url),
                }),
            )
            resultsExhausted = results.resultsExhausted
        } else {
            // This is the old blank search logic
            const entryLoader = this.choosePageEntryLoader(prevState)

            try {
                entries = await entryLoader(prevState)
            } catch (err) {
                this.emitMutation({ resultsExhausted: { $set: true } })
                return
            }

            if (entries.length < this.pageSize) {
                resultsExhausted = true
            }
        }

        for (const entry of entries) {
            try {
                let page = await this.lookupPageForEntry(entry, prevState)
                pages.push(page)
            } catch (err) {
                continue
            }
        }

        this.emitMutation({
            resultsExhausted: { $set: resultsExhausted },
            pages: {
                $set: initNormalizedState({
                    getId: (page) => page.url,
                    seedData: shouldPaginate
                        ? [...normalizedStateToArray(prevState.pages), ...pages]
                        : pages,
                }),
            },
        })
    }

    private search = debounce(
        async (state: State) =>
            executeUITask(this, 'reloadState', () => this.doLoadMore(state)),
        300,
    )

    setSearchQuery: EventHandler<'setSearchQuery'> = async ({
        event,
        previousState,
    }) => {
        this.emitMutation({
            reloadState: { $set: 'running' },
        })

        let mutation: UIMutation<State> = { searchQuery: { $set: event.query } }
        this.emitMutation(mutation)
        let nextState = this.withMutation(previousState, mutation)
        await this.search(nextState)
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

        let listEntries: ListEntry[] =
            prevState.selectedListId != null
                ? await metaPicker.findRecentListEntries(
                      prevState.selectedListId,
                      {
                          skip: prevState.pages.allIds.length,
                          limit: this.pageSize,
                      },
                  )
                : []

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

    private async lookupPageForEntry(
        { url, date, specificAnnotationIds }: PageLookupEntry,
        { listData }: State,
    ): Promise<UIPage> {
        const { overview, metaPicker, pageEditor } = this.props.storage.modules

        const page = await overview.findPage({ url })
        if (!page) {
            throw Error('No page found for entry')
        }

        const lists = await metaPicker.findListsByPage({
            url,
            includeRemoteIds: true,
        })
        let notes =
            specificAnnotationIds != null
                ? await pageEditor.findNotes({ urls: specificAnnotationIds })
                : await pageEditor.findNotesByPage({ url })

        let listEntriesByNote = await metaPicker.findAnnotListEntriesByAnnots({
            annotationUrls: notes.map((note) => note.url),
            filterOutSpecialLists: true,
        })

        // If any entries come in for lists not yet in state, make sure they're put in state
        let listsNotYetTracked = [
            ...new Set(
                Object.values(listEntriesByNote).flatMap((entries) =>
                    entries.map((e) => e.listId),
                ),
            ),
        ]
        listsNotYetTracked = listsNotYetTracked.filter(
            (listId) =>
                listData[listId] == null && !lists.find((l) => l.id === listId),
        )
        for (let listId of listsNotYetTracked) {
            await this.fetchAndSetListName(listId, true)
        }

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
                listIds:
                    listEntriesByNote[note.url]?.map((entry) => entry.listId) ??
                    [],
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

    performRetroSyncToDLMissingChanges: EventHandler<
        'performRetroSyncToDLMissingChanges'
    > = ({ event, previousState }) => {
        this.emitMutation({ shouldShowRetroSyncNotif: { $set: false } })
        this.props.navigation.navigate('CloudSync', {
            shouldRetrospectiveSync: true,
        })
    }

    toggleResultPress: EventHandler<'toggleResultPress'> = ({
        event,
        previousState,
    }) => {
        let url = normalizeUrl(event.fullUrl)

        this.props.services.actionSheet.show({
            hideOnSelection: true,
            actions: [
                {
                    key: 'copy-page',
                    title: 'Copy & Share page url',
                    subtitle: 'Via the share sheet of your phone',
                    icon: Copy,
                    onPress: async () => {
                        await Share.share({
                            url: event.fullUrl,
                            message:
                                Platform.OS === 'ios'
                                    ? undefined
                                    : event.fullUrl,
                        })
                    },
                },
                // {
                //     key: 'delete-page',
                //     title: 'Delete this page',
                //     subtitle: 'And all its associated notes',
                //     icon: Trash,
                //     onPress: async () => {
                //         Alert.alert(
                //             'Delete confirm',
                //             'Do you really want to delete this page?',
                //             [
                //                 { text: 'Cancel' },
                //                 {
                //                     text: 'Delete',
                //                     onPress: () =>
                //                         this.processUIEvent('deletePage', {
                //                             previousState,
                //                             event: {
                //                                 url: url,
                //                             },
                //                         }),
                //                 },
                //             ],
                //         )
                //     },
                // },
            ],
        })

        // return {
        //     pages: {
        //         byId: {
        //             [event.url]: {
        //                 isResultPressed: { $apply: (prev) => !prev },
        //             },
        //         },
        //     },
        //     // pages: (state) => {
        //     //     const page = state.get(url)!
        //     //     return state.set(url, {
        //     //         ...page,
        //     //         isResultPressed: !page.isResultPressed,
        //     //     })
        //     // },
        // }
    }

    private async openMemexFeed() {
        await Linking.openURL(getFeedUrl())
    }

    toggleNotes: EventHandler<'toggleNotes'> = async ({ previousState }) => {
        this.emitMutation({
            showNotes: { $set: !previousState.showNotes },
        })
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
