import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'

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
import Login from 'src/features/login/ui/screens/login'
import { MainNavigatorParamList, ShareNavigatorParamList } from './types'
import { lightTheme } from './color-themes'

export type NavigationContainerFactory = (deps: UIDependencies) => JSX.Element

const MainStack = createStackNavigator<MainNavigatorParamList>()
const ShareStack = createStackNavigator<ShareNavigatorParamList>()

export const createMainNavigator: NavigationContainerFactory = deps => (
    <NavigationContainer theme={lightTheme}>
        <MainStack.Navigator initialRouteName="Dashboard" headerMode="none">
            <MainStack.Screen name="Onboarding">
                {props => <Onboarding {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="PageEditor">
                {props => <PageEditor {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="NoteEditor">
                {props => <NoteEditor {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="Dashboard">
                {props => <Dashboard {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="Login">
                {props => <Login {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="ListsFilter">
                {props => <ListsFilter {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="DebugConsole">
                {props => <DebugConsole {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="MVPOverview">
                {props => <MVPOverview {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="SettingsMenu">
                {props => <SettingsMenu {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="Sync">
                {props => <Sync {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="Pairing">
                {props => <Pairing {...props} {...deps} />}
            </MainStack.Screen>
            <MainStack.Screen name="Reader">
                {props => (
                    <Reader
                        {...props}
                        {...deps}
                        loadContentScript={loadContentScript}
                    />
                )}
            </MainStack.Screen>
        </MainStack.Navigator>
    </NavigationContainer>
)

export const createShareNavigator: NavigationContainerFactory = deps => (
    <NavigationContainer theme={lightTheme}>
        <ShareStack.Navigator initialRouteName="ShareModal" headerMode="none">
            <ShareStack.Screen name="ShareModal">
                {props => <ShareModal {...props} {...deps} />}
            </ShareStack.Screen>
            <ShareStack.Screen name="Login">
                {props => <Login {...props} {...deps} />}
            </ShareStack.Screen>
        </ShareStack.Navigator>
    </NavigationContainer>
)
