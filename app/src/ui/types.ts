import { UIElement } from 'ui-logic-react'
import { NavigationScreenProp, NavigationRoute } from 'react-navigation'

import { Storage } from 'src/storage/types'
import { Services } from 'src/services/types'
import { UILogic } from 'ui-logic-core'
import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native'

export type UITaskState = 'pristine' | 'running' | 'done' | 'error'
export type UIServices<Required extends keyof Services> = Pick<
    Services,
    Required
>
export interface UIStorageModules<Required extends keyof Storage['modules']> {
    modules: Pick<Storage['modules'], Required>
}

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
    constructor(props: Props, logic: UILogic<State, Event>) {
        super(props, { logic })
    }
}

export abstract class NavigationScreen<
    Props extends NavigationProps,
    State,
    Event
> extends StatefulUIElement<Props, State, Event> {
    constructor(props: Props, options: { logic: UILogic<State, Event> }) {
        super(props, options.logic)
    }
}

export type TouchEventHandler = (
    e: NativeSyntheticEvent<NativeTouchEvent>,
) => void
