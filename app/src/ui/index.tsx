import {AppRegistry} from 'react-native'
import { createAppContainer } from 'react-navigation';
import {name as appName} from '../../app.json'

import { Storage } from 'src/storage/types';
import { Services } from 'src/services/types';

import React, { Component } from 'react';
import { View, Text } from 'react-native';

import AppNavigator from './navigator'

import HomeScreen from 'src/features/example/ui/screens/home-screen'
import ReactNativeNavigationService from 'src/services/navigation/react-native.js';

const AppNavigatorContainer = createAppContainer(AppNavigator)

export interface UIDependencies {
    storage : Storage
    services : Services
}

export class UI {
    private setupResolve! : (dependencies : UIDependencies) => void

    constructor() {
        const setupPromise = new Promise<UIDependencies>((resolve, reject) => {
            this.setupResolve = resolve
        })

        interface State {
            dependencies : UIDependencies | null
        }
        class AppContainer extends Component<{}, State> {
            state : State = {
                dependencies: null
            }

            async componentDidMount() {
                this.setState({ dependencies: await setupPromise})
            }

            componentWillUnmount() {
                console.log('unmounting')
            }

            render() {
                if (!this.state.dependencies) {
                    return (
                        <View>
                            <Text>Loading!?!!</Text>
                        </View>
                    )
                }

                return <AppNavigatorContainer ref={topLevelNavigator => {
                    if (!topLevelNavigator) {
                        return
                    }

                    const navigationService = (this.state.dependencies!.services.navigation as ReactNativeNavigationService)
                    navigationService.setNavigationContainerComponent(topLevelNavigator)
                }} />
            }
        }

        AppRegistry.registerComponent(appName, () => AppContainer)
    }

    initialize(options : { dependencies : UIDependencies }) {
        this.setupResolve(options.dependencies)
    }
}
