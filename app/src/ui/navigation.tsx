import React from 'react'
import {
    createSwitchNavigator,
    // NOTE: Sadly stack navigators seem to stop the share extension working :S
    // createStackNavigator,
    createAppContainer,
    NavigationContainer,
    NavigationScreenProp,
    NavigationRoute,
} from 'react-navigation'

import { UIDependencies } from './types'
import ShareModal from 'src/features/page-share/ui/screens/share-modal'
import Overview from 'src/features/overview/ui/screens/overview'
import DebugConsole from 'src/features/overview/ui/screens/debug-console'
import MVPOverview from 'src/features/overview/ui/screens/mvp-overview'
import Pairing from 'src/features/overview/ui/screens/pairing-screen'
import Onboarding from 'src/features/onboarding/ui/screens/onboarding'
import Sync from 'src/features/sync/ui/screens/sync'
import PageEditor from 'src/features/page-editor/ui/screens/page-editor'

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
            Onboarding: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <Onboarding {...props} {...deps} />,
            PageEditor: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <PageEditor {...props} {...deps} />,
            Overview: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <Overview {...props} {...deps} />,
            DebugConsole: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <DebugConsole {...props} {...deps} />,
            MVPOverview: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <MVPOverview {...props} {...deps} />,
            Sync: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <Sync {...props} {...deps} />,
            Pairing: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <Pairing {...props} {...deps} />,
        },
        {
            initialRouteName: 'Overview',
        },
    )

const createShareNavigator: NavigationContainerCreator = deps =>
    createSwitchNavigator(
        {
            ShareModal: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <ShareModal {...props} {...deps} />,
        },
        {
            initialRouteName: 'ShareModal',
        },
    )

export const createApp: NavigationContainerCreator = deps =>
    createAppContainer(createMainNavigator(deps))

export const createShareUI: NavigationContainerCreator = deps =>
    createAppContainer(createShareNavigator(deps))
