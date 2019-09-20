import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { MetaType } from 'src/features/meta-picker/types'

export interface State {
    pageUrl: string
    statusText: string
    noteText: string
    tagsToAdd: string[]
    collectionsToAdd: string[]
    isStarred: boolean
    isModalShown: boolean
    isPageSaving: boolean
    metaViewShown?: MetaType
}
export type Event = UIEvent<{
    toggleTag: { name: string }
    toggleCollection: { name: string }
    setPageUrl: { url: string }
    setMetaViewType: { type?: MetaType }
    setModalVisible: { shown: boolean }
    setNoteText: { value: string }
    setPageStar: { value: boolean }
    setPageSaving: { value: boolean }
    setStatusText: { value: string }
    setTagsToAdd: { values: string[] }
    setCollectionsToAdd: { values: string[] }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return {
            pageUrl: '',
            isModalShown: true,
            isStarred: false,
            isPageSaving: false,
            tagsToAdd: [],
            collectionsToAdd: [],
            noteText: '',
            statusText: '',
        }
    }

    setPageUrl(
        incoming: IncomingUIEvent<State, Event, 'setPageUrl'>,
    ): UIMutation<State> {
        return { pageUrl: { $set: incoming.event.url } }
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

    setTagsToAdd(
        incoming: IncomingUIEvent<State, Event, 'setTagsToAdd'>,
    ): UIMutation<State> {
        return { tagsToAdd: { $set: incoming.event.values } }
    }

    setCollectionsToAdd(
        incoming: IncomingUIEvent<State, Event, 'setCollectionsToAdd'>,
    ): UIMutation<State> {
        return { collectionsToAdd: { $set: incoming.event.values } }
    }

    toggleTag(
        incoming: IncomingUIEvent<State, Event, 'toggleTag'>,
    ): UIMutation<State> {
        return {
            tagsToAdd: state => {
                const index = state.indexOf(incoming.event.name)

                if (index !== -1) {
                    return [...state.slice(0, index), ...state.slice(index + 1)]
                }

                return [...state, incoming.event.name]
            },
        }
    }

    toggleCollection(
        incoming: IncomingUIEvent<State, Event, 'toggleCollection'>,
    ): UIMutation<State> {
        return {
            collectionsToAdd: state => {
                const index = state.indexOf(incoming.event.name)

                if (index !== -1) {
                    return [...state.slice(0, index), ...state.slice(index + 1)]
                }

                return [...state, incoming.event.name]
            },
        }
    }
}
