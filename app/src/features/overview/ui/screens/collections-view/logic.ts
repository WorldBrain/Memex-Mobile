import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { UICollection } from 'src/features/overview/types'
import initTestData from './test-data'

export interface State {
    selectedCollection?: string
    collections: Set<UICollection>
}

export type Event = UIEvent<{
    setCollections: { collections: Set<UICollection> }
    selectCollection: { name: string }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return initTestData()
    }

    setCollections(
        incoming: IncomingUIEvent<State, Event, 'setCollections'>,
    ): UIMutation<State> {
        return { collections: { $set: incoming.event.collections } }
    }

    selectCollection(
        incoming: IncomingUIEvent<State, Event, 'selectCollection'>,
    ): UIMutation<State> {
        return { selectedCollection: { $set: incoming.event.name } }
    }
}
