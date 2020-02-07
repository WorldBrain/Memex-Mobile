import moment from 'moment'
import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UIPage } from 'src/features/overview/types'
import { UITaskState, UIStorageModules } from 'src/ui/types'
import { loadInitial, executeUITask } from 'src/ui/utils'
import { MOBILE_LIST_NAME } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/constants'
import { ListEntry } from 'src/features/meta-picker/types'

export interface State {
    loadState: UITaskState
    loadMoreState: UITaskState
    deletingState: UITaskState
    deletingFinishedAt: number
    couldHaveMore: boolean
    pages: Map<string, UIPage>
}
export type Event = UIEvent<{
    loadMore: {}
    setPages: { pages: UIPage[] }
    deletePage: { url: string }
    togglePageStar: { url: string }
    toggleResultPress: { url: string }
}>

export interface LogicDependencies {
    storage: UIStorageModules<'metaPicker' | 'overview'>
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
            deletingState: 'pristine',
            deletingFinishedAt: 0,
            couldHaveMore: true,
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

        const { metaPicker, overview } = this.dependencies.storage.modules
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
        const entries: Array<[string, UIPage]> = await Promise.all(
            listEntries.map(
                async (listEntry): Promise<[string, UIPage]> => [
                    listEntry.pageUrl,
                    {
                        url: listEntry.pageUrl,
                        pageUrl: listEntry.fullUrl,
                        titleText:
                            (
                                await overview.findPage({
                                    url: listEntry.pageUrl,
                                })
                            )?.fullTitle || '<Missing title>',
                        date: moment(listEntry.createdAt).fromNow(),
                    },
                ],
            ),
        )
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
        await executeUITask<State, 'deletingState', void>(
            this,
            'deletingState',
            async () => {
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
                        deletingFinishedAt: { $set: this.getNow() },
                    })
                }
            },
        )
    }

    togglePageStar({
        event: { url },
    }: IncomingUIEvent<State, Event, 'togglePageStar'>): UIMutation<State> {
        return {
            pages: state => {
                const page = state.get(url)!
                return state.set(url, { ...page, isStarred: !page.isStarred })
            },
        }
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

// export function shouldShowDeletingStatus(state: State, now?: number) {
//     const THRESHOLD = 1000 * 5
//     return (
//         state.deletingState === 'running' ||
//         ((now || Date.now()) - state.deletingFinishedAt) <= THRESHOLD
//     )
// }
