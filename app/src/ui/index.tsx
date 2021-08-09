import React, { Component } from 'react'
import { AppRegistry, Dimensions } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import { name as appName, shareExtName } from '../../app.json'
import {
    createMainNavigator,
    createShareNavigator,
    NavigationContainerFactory,
} from './navigation'
import { UIDependencies, CoreUIState } from './types'
import LoadingScreen from './components/loading-screen'

export class UI {
    private setupResolve!: (dependencies: UIDependencies) => void

    constructor() {
        const entireScreenWidth = Dimensions.get('screen').width

        EStyleSheet.build({
            $textColor: '#3a2f45',
            $greenColor: '#5cd9a6',
            $purpleColor: '#72727f',
            $rem: entireScreenWidth / 30,
        })

        const setupPromise = new Promise<UIDependencies>((resolve) => {
            this.setupResolve = resolve
        })

        const setupContainerComponent = (
            containerCreator: NavigationContainerFactory,
        ) => () =>
            class extends Component<{}, CoreUIState> {
                state: CoreUIState = {
                    dependencies: {} as any,
                    isLoggedIn: false,
                }

                async componentDidMount() {
                    const dependencies = await setupPromise
                    const user = await dependencies.services.auth.getCurrentUser()
                    this.setState({ dependencies, isLoggedIn: user != null })
                }

                render() {
                    if (!this.state.dependencies) {
                        return <LoadingScreen />
                    }

                    return containerCreator(this.state)
                }
            }

        AppRegistry.registerComponent(
            appName,
            setupContainerComponent(createMainNavigator),
        )

        AppRegistry.registerComponent(
            shareExtName,
            setupContainerComponent(createShareNavigator),
        )
    }

    initialize(options: { dependencies: UIDependencies }) {
        this.setupResolve(options.dependencies)
    }
}
