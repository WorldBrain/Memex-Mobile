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

import { loadContentScript } from 'src/features/reader/utils/load-content-script'

import { UIDependencies } from '../types'
import ShareModal from 'src/features/page-share/ui/screens/share-modal'
import ListsFilter from 'src/features/overview/ui/screens/lists-filter'
import Dashboard from 'src/features/overview/ui/screens/dashboard'
import NoteEditor from 'src/features/overview/ui/screens/note-editor'
import DebugConsole from 'src/features/overview/ui/screens/debug-console'
import MVPOverview from 'src/features/overview/ui/screens/mvp-overview'
import Pairing from 'src/features/overview/ui/screens/pairing-screen'
import Onboarding from 'src/features/onboarding/ui/screens/onboarding'
import Sync from 'src/features/sync/ui/screens/sync'
import PageEditor from 'src/features/page-editor/ui/screens/page-editor'
import SettingsMenu from 'src/features/settings-menu/ui/screens/settings-menu'
import Reader from 'src/features/reader/ui/screens/reader'

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
            NoteEditor: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <NoteEditor {...props} {...deps} />,
            Overview: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <Dashboard {...props} {...deps} />,
            ListsFilter: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <ListsFilter {...props} {...deps} />,
            DebugConsole: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <DebugConsole {...props} {...deps} />,
            MVPOverview: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <MVPOverview {...props} {...deps} />,
            SettingsMenu: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <SettingsMenu {...props} {...deps} />,
            Sync: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <Sync {...props} {...deps} />,
            Pairing: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => <Pairing {...props} {...deps} />,
            Reader: (props: {
                navigation: NavigationScreenProp<NavigationRoute>
            }) => (
                <Reader
                    {...props}
                    {...deps}
                    loadContentScript={loadContentScript}
                />
            ),
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
