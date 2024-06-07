import { UILogic, UIEvent } from 'ui-logic-core'

import type { MainNavProps, UIStorageModules, UIServices } from 'src/ui/types'

export interface Props extends MainNavProps<'ListsFilter'> {
    storage: UIStorageModules<'metaPicker'>
    services: UIServices<'syncStorage'>
}

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
