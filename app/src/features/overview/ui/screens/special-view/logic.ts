import moment from 'moment'
import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UIPageWithNotes as UIPage, UINote } from 'src/features/overview/types'
import { UITaskState, UIStorageModules } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { MOBILE_LIST_NAME } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/constants'
import { ListEntry } from 'src/features/meta-picker/types'

export interface State {
    loadState: UITaskState
    loadMoreState: UITaskState
    couldHaveMore: boolean
    pages: Map<string, UIPage>

    action?: 'delete' | 'togglePageStar'
    actionState: UITaskState
    actionFinishedAt: number
}
export type Event = UIEvent<{
    loadMore: {}
    setPages: { pages: UIPage[] }
    deletePage: { url: string }
    togglePageStar: { url: string }
    toggleResultPress: { url: string }
}>

export interface LogicDependencies {
    storage: UIStorageModules<'metaPicker' | 'overview' | 'pageEditor'>
    pageSize?: number
    getNow?: () => number
}
export default class Logic extends UILogic<State, Event> {
    private dependencies: LogicDependencies
    private pageSize: number
    getNow: () => number

    constructor(dependencies: LogicDependencies) {
        super()
        this.dependencies = dependencies
        this.pageSize = dependencies.pageSize || 20
        this.getNow = dependencies.getNow || (() => Date.now())
    }

    getInitialState(): State {
        return {
            loadState: 'pristine',
            loadMoreState: 'pristine',
            couldHaveMore: true,
            actionState: 'pristine',
            actionFinishedAt: 0,
            pages: new Map(),
        }
    }

    async init(incoming: IncomingUIEvent<State, Event, 'init'>) {
        await loadInitial<State>(this, async () => {
            await this.doLoadMore(incoming.previousState)
        })
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

        const {
            metaPicker,
            overview,
            pageEditor,
        } = this.dependencies.storage.modules
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
            const tags = await metaPicker.findTagsByPage({
                url: listEntry.pageUrl,
            })

            const notes = await pageEditor.findNotes({ url: listEntry.pageUrl })

            entries.push([
                listEntry.pageUrl,
                {
                    url: listEntry.pageUrl,
                    domain: (
                        await overview.findPage({
                            url: listEntry.pageUrl,
                        })
                    )?.domain,
                    fullUrl: (
                        await overview.findPage({
                            url: listEntry.pageUrl,
                        })
                    )?.fullUrl,
                    titleText:
                        (
                            await overview.findPage({
                                url: listEntry.pageUrl,
                            })
                        )?.fullTitle || listEntry.pageUrl,
                    isStarred: await overview.isPageStarred({
                        url: listEntry.pageUrl,
                    }),
                    date: moment(listEntry.createdAt).fromNow(),
                    tags: tags.map(tag => tag.name),
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
                    await this.dependencies.storage.modules.overview.deletePage(
                        { url: incoming.event.url },
                    )
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
                    await this.dependencies.storage.modules.overview.setPageStar(
                        {
                            url,
                            isStarred,
                        },
                    )
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
