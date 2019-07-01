import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from "ui-logic-core"

import { ResultType } from '../../../types'

export interface State {
    selectedResultType : ResultType
}
export type Event = UIEvent<{
    setResultType: { resultType : ResultType }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return { selectedResultType: 'pages' }
    }

    setResultType(incoming : IncomingUIEvent<State, Event, 'setResultType'>) : UIMutation<State> {
        return { selectedResultType: { $set: incoming.event.resultType } }
    }
}
