import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { MetaType } from 'src/features/meta-picker/types'

export interface State {
    statusText: string
    noteText: string
    collectionCount: number
    tagCount: number
    isStarred: boolean
    isModalShown: boolean
    isPageSaving: boolean
    metaViewShown?: MetaType
}
export type Event = UIEvent<{
    setMetaViewType: { type?: MetaType }
    setModalVisible: { shown: boolean }
    setNoteText: { value: string }
    setPageStar: { value: boolean }
    setPageSaving: { value: boolean }
    setStatusText: { value: string }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return {
            isModalShown: true,
            isStarred: false,
            isPageSaving: false,
            noteText: '',
            statusText: '',
            collectionCount: 0,
            tagCount: 0,
        }
    }

    setStatusText(
        incoming: IncomingUIEvent<State, Event, 'setStatusText'>,
    ): UIMutation<State> {
        return { statusText: { $set: incoming.event.value } }
    }

    setPageSaving(
        incoming: IncomingUIEvent<State, Event, 'setPageSaving'>,
    ): UIMutation<State> {
        return { isPageSaving: { $set: incoming.event.value } }
    }

    setMetaViewType(
        incoming: IncomingUIEvent<State, Event, 'setMetaViewType'>,
    ): UIMutation<State> {
        return { metaViewShown: { $set: incoming.event.type } }
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
}
