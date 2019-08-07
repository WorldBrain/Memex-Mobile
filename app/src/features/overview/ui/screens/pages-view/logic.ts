import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import initTestData from './test-data'
import { UIPage } from 'src/features/overview/types'

export interface State {
    pages: Map<string, UIPage>
}
export type Event = UIEvent<{
    setPages: { pages: UIPage[] }
    deletePage: { url: string }
    togglePageStar: { url: string }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return initTestData()
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

    deletePage(
        incoming: IncomingUIEvent<State, Event, 'deletePage'>,
    ): UIMutation<State> {
        return {
            pages: state => {
                state.delete(incoming.event.url)
                return state
            },
        }
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
}
