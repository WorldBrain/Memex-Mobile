import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'

import { loadContentScript } from 'src/features/reader/utils/load-content-script'
import { CoreUIState } from '../types'
import ShareModal from 'src/features/page-share/ui/screens/share-modal'
import ListsFilter from 'src/features/overview/ui/screens/lists-filter'
import Dashboard from 'src/features/overview/ui/screens/dashboard'
import NoteEditor from 'src/features/overview/ui/screens/note-editor'
import DebugConsole from 'src/features/overview/ui/screens/debug-console'
import Pairing from 'src/features/overview/ui/screens/pairing-screen'
import Onboarding from 'src/features/onboarding/ui/screens/onboarding'
import Sync from 'src/features/sync/ui/screens/sync'
import CloudSync from 'src/features/personal-cloud/ui/sync-screen'
import PageEditor from 'src/features/page-editor/ui/screens/page-editor'
import SettingsMenu from 'src/features/settings-menu/ui/screens/settings-menu'
import Reader from 'src/features/reader/ui/screens/reader'
import Login from 'src/features/login/ui/screens/login'
import { MainNavigatorParamList, ShareNavigatorParamList } from './types'
import { lightTheme } from './color-themes'

export type NavigationContainerFactory = (state: CoreUIState) => JSX.Element

const MainStack = createStackNavigator<MainNavigatorParamList>()
const ShareStack = createStackNavigator<ShareNavigatorParamList>()

export const createMainNavigator: NavigationContainerFactory = ({
    isLoggedIn,
    dependencies: deps,
}) => {
    const freeRoutes = [
        <MainStack.Screen name="Onboarding">
            {(props) => <Onboarding {...props} {...deps} />}
        </MainStack.Screen>,
    ]

    const publicRoutes = [
        ...freeRoutes,
        <MainStack.Screen name="Login">
            {(props) => <Login {...props} {...deps} />}
        </MainStack.Screen>,
    ]

    const protectedRoutes = [
        <MainStack.Screen name="Dashboard">
            {(props) => <Dashboard {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="PageEditor">
            {(props) => <PageEditor {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="NoteEditor">
            {(props) => <NoteEditor {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="ListsFilter">
            {(props) => <ListsFilter {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="DebugConsole">
            {(props) => <DebugConsole {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="SettingsMenu">
            {(props) => <SettingsMenu {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="Sync">
            {(props) => <Sync {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="CloudSync">
            {(props) => <CloudSync {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="Pairing">
            {(props) => <Pairing {...props} {...deps} />}
        </MainStack.Screen>,
        <MainStack.Screen name="Reader">
            {(props) => (
                <Reader
                    {...props}
                    {...deps}
                    loadContentScript={loadContentScript}
                />
            )}
        </MainStack.Screen>,
        ...freeRoutes,
    ]

    return (
        <NavigationContainer theme={lightTheme}>
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
    return (
        <NavigationContainer theme={lightTheme}>
            <ShareStack.Navigator headerMode="none">
                {isLoggedIn ? (
                    <ShareStack.Screen name="ShareModal">
                        {(props) => <ShareModal {...props} {...deps} />}
                    </ShareStack.Screen>
                ) : (
                    <ShareStack.Screen name="Login">
                        {(props) => <Login {...props} {...deps} />}
                    </ShareStack.Screen>
                )}
            </ShareStack.Navigator>
        </NavigationContainer>
    )
}
