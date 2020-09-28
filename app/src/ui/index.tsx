import React, { Component } from 'react'
import { AppRegistry, Dimensions } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

import { name as appName, shareExtName } from '../../app.json'
import {
    createApp,
    createShareUI,
    NavigationContainerCreator,
} from './navigation'
import { UIDependencies } from './types'
import LoadingScreen from './components/loading-screen'

interface State {
    dependencies?: UIDependencies
}

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

        const setupPromise = new Promise<UIDependencies>(resolve => {
            this.setupResolve = resolve
        })

        const setupContainerComponent = (
            containerCreator: NavigationContainerCreator,
        ) => () =>
            class AbstractContainer extends Component<{}, State> {
                state: State = {}

                async componentDidMount() {
                    const dependencies = await setupPromise
                    this.setState(() => ({ dependencies }))
                }

                render() {
                    if (!this.state.dependencies) {
                        return <LoadingScreen />
                    }

                    const AppContainer = containerCreator(
                        this.state.dependencies,
                    )
                    return <AppContainer />
                }
            }

        AppRegistry.registerComponent(
            appName,
            setupContainerComponent(createApp),
        )

        AppRegistry.registerComponent(
            shareExtName,
            setupContainerComponent(createShareUI),
        )
    }

    initialize(options: { dependencies: UIDependencies }) {
        this.setupResolve(options.dependencies)
    }
}
