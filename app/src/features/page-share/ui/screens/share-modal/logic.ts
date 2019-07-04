import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { MetaType } from 'src/features/meta-picker/types'

export interface State {
    statusText: string
    noteText: string
    collectionCount: number
    tagCount: number
    isStarred: boolean
    isModalShown: boolean
    metaViewShown?: MetaType
}
export type Event = UIEvent<{
    setMetaViewType: { type: MetaType }
    setModalVisible: { shown: boolean }
    setNoteText: { value: string }
    setPageStar: { value: boolean }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return {
            isModalShown: true,
            isStarred: false,
            noteText: '',
            statusText: 'Page Saved!',
            collectionCount: 0,
            tagCount: 0,
        }
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
