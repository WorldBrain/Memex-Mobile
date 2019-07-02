import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from "ui-logic-core"

import { ResultType } from '../../../types'

export interface State {
    selectedResultType : ResultType
    showCollectionsView: boolean
}
export type Event = UIEvent<{
    setResultType: { resultType : ResultType }
    setShowCollectionsView: { show: boolean }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return {
            showCollectionsView: false,
            selectedResultType: 'notes',
        }
    }

    setResultType(incoming : IncomingUIEvent<State, Event, 'setResultType'>) : UIMutation<State> {
        return { selectedResultType: { $set: incoming.event.resultType } }
    }

    setShowCollectionsView(incoming : IncomingUIEvent<State, Event, 'setShowCollectionsView'>) : UIMutation<State> {
        return { showCollectionsView: { $set: incoming.event.show } }
    }
}
