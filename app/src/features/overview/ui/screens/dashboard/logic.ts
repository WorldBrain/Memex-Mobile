import moment from 'moment'
import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { AppState, AppStateStatus } from 'react-native'

import { UIPageWithNotes as UIPage, UINote } from 'src/features/overview/types'
import { UITaskState, UIStorageModules, NavigationProps } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { MOBILE_LIST_NAME } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/constants'
import { ListEntry } from 'src/features/meta-picker/types'

export interface State {
    loadState: UITaskState
    reloadState: UITaskState
    loadMoreState: UITaskState
    couldHaveMore: boolean
    pages: Map<string, UIPage>

    action?: 'delete' | 'togglePageStar'
    actionState: UITaskState
    actionFinishedAt: number
}
export type Event = UIEvent<{
    reload: {}
    loadMore: {}
    changeAppState: { nextState: AppStateStatus }
    setPages: { pages: UIPage[] }
    deletePage: { url: string }
    togglePageStar: { url: string }
    toggleResultPress: { url: string }
}>

export interface Props extends NavigationProps {
    storage: UIStorageModules<'metaPicker' | 'overview' | 'pageEditor'>
    pageSize?: number
    getNow?: () => number
}

export default class Logic extends UILogic<State, Event> {
    private pageSize: number
    getNow: () => number

    constructor(private props: Props) {
        super()

        this.pageSize = props.pageSize || 20
        this.getNow = props.getNow || (() => Date.now())
    }

    getInitialState(): State {
        return {
            loadState: 'pristine',
            reloadState: 'pristine',
            loadMoreState: 'pristine',
            couldHaveMore: true,
            actionState: 'pristine',
            actionFinishedAt: 0,
            pages: new Map(),
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        const handleAppStatusChange = (nextState: AppStateStatus) => {
            this.processUIEvent('changeAppState', {
                ...incoming,
                event: { nextState },
            })
        }
        AppState.addEventListener('change', handleAppStatusChange)

        await loadInitial<State>(this, async () => {
            await this.doLoadMore(this.getInitialState())
        })
    }

    changeAppState(incoming: IncomingUIEvent<State, Event, 'changeAppState'>) {
        if (incoming.event.nextState === 'active') {
            return this.processUIEvent('reload', { ...incoming })
        }
    }

    async reload() {
        await executeUITask<State, 'reloadState', void>(
            this,
            'reloadState',
            async () => {
                await this.doLoadMore(this.getInitialState())
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

        const { metaPicker, overview, pageEditor } = this.props.storage.modules
        const mobileList = await metaPicker.findListsByNames({
            names: [MOBILE_LIST_NAME],
        })
        if (!mobileList.length) {
            this.emitMutation({ couldHaveMore: { $set: false } })
            return
        }

        const listEntries: ListEntry[] = await metaPicker.findRecentListEntries(
            mobileList[0].id,
            {
                skip: prevState.pages.size,
                limit: this.pageSize,
            },
        )
        if (listEntries.length < this.pageSize) {
            couldHaveMore = false
        }

        const entries: Array<[string, UIPage]> = []
        for (const listEntry of listEntries) {
            const page = await overview.findPage({ url: listEntry.pageUrl })
            const tags = await metaPicker.findTagsByPage({
                url: listEntry.pageUrl,
            })

            const notes = await pageEditor.findNotes({ url: listEntry.pageUrl })
            const lists = await metaPicker.findListsByPage({
                url: listEntry.pageUrl,
            })

            entries.push([
                listEntry.pageUrl,
                {
                    url: listEntry.pageUrl,
                    domain: page!.domain,
                    fullUrl: page!.fullUrl,
                    pageUrl: page!.url,
                    titleText: page!.fullTitle || page.url,
                    isStarred: !!page!.isStarred,
                    date: moment(listEntry.createdAt).fromNow(),
                    tags: tags.map(tag => tag.name),
                    lists: lists.map(list => list.name),
                    notes: notes.map<UINote>(note => ({
                        url: note.url,
                        isStarred: note.isStarred,
                        commentText: note.comment || undefined,
                        noteText: note.body,
                        date: note.lastEdited
                            ? note.lastEdited.toDateString()
                            : note.createdWhen?.toDateString(),
                    })),
                },
            ])
        }

        this.emitMutation({
            pages: {
                $set: new Map<string, UIPage>([
                    ...prevState.pages.entries(),
                    ...entries,
                ]),
            },
            couldHaveMore: { $set: couldHaveMore },
        })
    }

    setPages(
        incoming: IncomingUIEvent<State, Event, 'setPages'>,
    ): UIMutation<State> {
        const pageEntries = incoming.event.pages.map(page => [
            page.url,
            page,
        ]) as [string, UIPage][]
        return { pages: { $set: new Map(pageEntries) } }
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
                        pages: state => {
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
                        pages: state => {
                            const page = state.get(url)!
                            return state.set(url, { ...page, isStarred })
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
            pages: state => {
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
