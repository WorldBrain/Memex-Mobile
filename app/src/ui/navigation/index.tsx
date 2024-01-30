import React from 'react'
import { AppState } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer, LinkingOptions } from '@react-navigation/native'

import { loadContentScript } from 'src/features/reader/utils/load-content-script'
import { CoreUIState } from '../types'
import ShareModal from 'src/features/page-share/ui/screens/share-modal'
import ListsFilter from 'src/features/overview/ui/screens/lists-filter'
import Dashboard from 'src/features/overview/ui/screens/dashboard'
import NoteEditor from 'src/features/overview/ui/screens/note-editor'
import DebugConsole from 'src/features/overview/ui/screens/debug-console'
import Pairing from 'src/features/overview/ui/screens/pairing-screen'
import Onboarding from 'src/features/onboarding/ui/screens/onboarding'
import CloudSync from 'src/features/personal-cloud/ui/sync-screen'
import PageEditor from 'src/features/page-editor/ui/screens/page-editor'
import SettingsMenu from 'src/features/settings-menu/ui/screens/settings-menu'
import Reader from 'src/features/reader/ui/screens/reader'
import Login from 'src/features/login/ui/screens/login'
import { MainNavigatorParamList } from './types'
import { lightTheme } from './color-themes'
import { getDeviceDetails } from 'src/features/page-share/ui/screens/share-modal/util'
import { DEEP_LINK_SCHEME } from './deep-linking'

export type NavigationContainerFactory = (state: CoreUIState) => JSX.Element

const MainStack = createStackNavigator<MainNavigatorParamList>()
const ShareStack = createStackNavigator<MainNavigatorParamList>()

export const createMainNavigator: NavigationContainerFactory = ({
    isLoggedIn,
    dependencies: deps,
}) => {
    const freeRoutes = [
        <MainStack.Screen name="Onboarding" key="Onboarding">
            {(props) => <Onboarding {...props} {...deps} />}
        </MainStack.Screen>,
    ]

    const publicRoutes = [
        ...freeRoutes,
        <MainStack.Screen name="Login" key="Login">
            {(props) => <Login {...props} {...deps} />}
        </MainStack.Screen>,
    ]

    const protectedRoutes = [
        <MainStack.Screen name="Dashboard" key="Dashboard">
            {(props) => <Dashboard {...props} {...deps} appState={AppState} />}
        </MainStack.Screen>,
        <MainStack.Screen name="PageEditor" key="PageEditor">
            {(props) => <PageEditor {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="NoteEditor" key="NoteEditor">
            {(props) => <NoteEditor {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="ListsFilter" key="ListsFilter">
            {(props) => <ListsFilter {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="DebugConsole" key="DebugConsole">
            {(props) => <DebugConsole {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="SettingsMenu" key="SettingsMenu">
            {(props) => <SettingsMenu {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="CloudSync" key="CloudSync">
            {(props) => <CloudSync {...props} {...deps} appState={AppState} />}
        </MainStack.Screen>,
        <MainStack.Screen name="Pairing" key="Pairing">
            {(props) => <Pairing {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="Reader" key="Reader">
            {(props) => (
                <Reader
                    {...props}
                    {...deps}
                    loadContentScript={loadContentScript}
                    deviceInfo={getDeviceDetails()}
                    location={'mainApp'}
                />
            )}
        </MainStack.Screen>,
        ...freeRoutes,
    ]

    const linking: LinkingOptions = {
        prefixes: [DEEP_LINK_SCHEME],
        config: {
            screens: {
                Dashboard: 'dashboard/:openFeed?',
                Reader: {
                    path: 'reader/:url',
                    parse: {
                        url: String,
                    },
                },
            },
        },
    }

    return (
        <NavigationContainer theme={lightTheme} linking={linking}>
            <MainStack.Navigator headerMode="none">
                {isLoggedIn ? protectedRoutes : publicRoutes}
            </MainStack.Navigator>
        </NavigationContainer>
    )
}

export const createShareNavigator: NavigationContainerFactory = ({
    dependencies: deps,
    isLoggedIn,
}) => {
    const protectedRoutes = [
        <ShareStack.Screen name="ShareModal">
            {(props) => (
                <ShareModal
                    {...props}
                    {...deps}
                    loadContentScript={loadContentScript}
                />
            )}
        </ShareStack.Screen>,
        <ShareStack.Screen name="PageEditor" key="PageEditor">
            {(props) => <PageEditor {...props} {...deps} />}
        </ShareStack.Screen>,
        <ShareStack.Screen name="NoteEditor" key="NoteEditor">
            {(props) => <NoteEditor {...props} {...deps} />}
        </ShareStack.Screen>,
        <ShareStack.Screen name="ListsFilter" key="ListsFilter">
            {(props) => <ListsFilter {...props} {...deps} />}
        </ShareStack.Screen>,
    ]

    return (
        <NavigationContainer theme={lightTheme}>
            <ShareStack.Navigator headerMode="none">
                {isLoggedIn ? (
                    protectedRoutes
                ) : (
                    <ShareStack.Screen name="Login">
                        {(props) => <Login {...props} {...deps} />}
                    </ShareStack.Screen>
                )}
            </ShareStack.Navigator>
        </NavigationContainer>
    )
}
