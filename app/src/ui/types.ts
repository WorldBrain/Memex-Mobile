import { UIElement } from 'ui-logic-react'
import { NavigationScreenProp, NavigationRoute } from 'react-navigation'

export interface DefaultProps {
    navigation: NavigationScreenProp<NavigationRoute>
}

export abstract class StatefulUIElement<Props, State, Event>
    extends UIElement<Props & DefaultProps, State, Event> {
        constructor(props, logic) {
            super(props, logic)
        }
    }
