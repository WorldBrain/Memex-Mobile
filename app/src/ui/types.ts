import { UIElement } from 'ui-logic-react'
import { NavigationScreenProp, NavigationRoute } from 'react-navigation'

import { Storage } from 'src/storage/types'
import { Services } from 'src/services/types'

export interface UIDependencies {
    storage: Storage
    services: Services
}

export interface NavigationProps {
    navigation: NavigationScreenProp<NavigationRoute>
}

export abstract class StatefulUIElement<Props, State, Event> extends UIElement<
    Props,
    State,
    Event
> {
    constructor(props, logic) {
        super(props, logic)
    }
}

export abstract class NavigationScreen<
    Props,
    State,
    Event
> extends StatefulUIElement<
    Props & NavigationProps & UIDependencies,
    State,
    Event
> {
    constructor(props, logic) {
        super(props, logic)
    }
}
