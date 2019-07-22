import React from 'react'
import {
    createSwitchNavigator,
    // NOTE: Sadly stack navigators seem to stop the share extension working :S
    // createStackNavigator,
    createAppContainer,
    NavigationContainer,
} from 'react-navigation'

import Overview from 'src/features/overview/ui/screens/overview'
import Onboarding from 'src/features/onboarding/ui/screens/onboarding'
import Sync from 'src/features/sync/ui/screens/sync'
import PageEditor from 'src/features/page-editor/ui/screens/page-editor'
import { UIDependencies } from './types'

export type NavigationContainerCreator = (
    deps: UIDependencies,
) => NavigationContainer

// const OverviewNavigator = createStackNavigator(
//     {
//         Overview: { screen: Overview },
//         PageEditor: { screen: PageEditor },
//     },
//     { headerMode: 'none' },
// )

const createMainNavigator: NavigationContainerCreator = deps =>
    createSwitchNavigator(
        {
            Onboarding: props => <Onboarding {...props} {...deps} />,
            PageEditor: props => <PageEditor {...props} {...deps} />,
            Overview: props => <Overview {...props} {...deps} />,
            Sync: props => <Sync {...props} {...deps} />,
        },
        {
            initialRouteName: 'Overview',
        },
    )

const createApp: NavigationContainerCreator = deps =>
    createAppContainer(createMainNavigator(deps))
export default createApp
