import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'
import { MetaTypeShape } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/types'

import { NavigationProps } from 'src/ui/types'

export interface Props extends NavigationProps {}

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
