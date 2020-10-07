import { UILogic, UIEvent } from 'ui-logic-core'

import { MainNavProps } from 'src/ui/types'

export interface Props extends MainNavProps<'ListsFilter'> {}

export interface State {}

export type Event = UIEvent<{}>

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {}
    }
}
