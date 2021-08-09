import { NativeSyntheticEvent, NativeTouchEvent } from 'react-native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { UILogic } from 'ui-logic-core'
import { UIElement } from 'ui-logic-react'

import { Storage } from 'src/storage/types'
import { Services } from 'src/services/types'
import {
    MainNavigatorParamList,
    MainNavigatorRoutes,
    ShareNavigatorRoutes,
    ShareNavigatorParamList,
} from 'src/ui/navigation/types'

export type UITaskState = 'pristine' | 'running' | 'done' | 'error'
export type UIServices<Required extends keyof Services> = Pick<
    Services,
    Required
>
export interface UIStorageModules<Required extends keyof Storage['modules']> {
    modules: Pick<Storage['modules'], Required>
}

export interface CoreUIState {
    dependencies: UIDependencies
    isLoggedIn: boolean
}

export interface UIDependencies {
    storage: Storage
    services: Services
}

export interface MainNavProps<Route extends MainNavigatorRoutes> {
    navigation: StackNavigationProp<MainNavigatorParamList, Route>
    route: RouteProp<MainNavigatorParamList, Route>
}

export interface ShareNavProps<Route extends ShareNavigatorRoutes> {
    navigation: StackNavigationProp<ShareNavigatorParamList, Route>
    route: RouteProp<ShareNavigatorParamList, Route>
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

export type TouchEventHandler = (
    e: NativeSyntheticEvent<NativeTouchEvent>,
) => void
