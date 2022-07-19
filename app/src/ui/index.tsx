import React, { Component } from 'react'
import { AppRegistry, Dimensions } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { authChanges } from '@worldbrain/memex-common/lib/authentication/utils'
import { theme } from 'src/ui/components/theme/theme'
import { ThemeProvider } from 'styled-components'
import 'src/ui/components/action-sheets'

import { name as appName, shareExtName } from '../../app.json'
import {
    createMainNavigator,
    createShareNavigator,
    NavigationContainerFactory,
} from './navigation'
import type { UIDependencies, CoreUIState } from './types'
import type { Services } from 'src/services/types'
import LoadingScreen from './components/loading-screen'

export class UI {
    private setupResolve!: (dependencies: UIDependencies) => void

    constructor() {
        const entireScreenWidth = Dimensions.get('screen').width

        EStyleSheet.build({
            $textColor: '#3a2f45',
            $greenColor: theme.colors.backgroundHighlight,
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
                    dependencies: null!,
                    isLoggedIn: false,
                }

                async componentDidMount() {
                    const dependencies = await setupPromise
                    const user = await dependencies.services.auth.getCurrentUser()
                    this.observeAuthChanges(dependencies.services)
                    this.setState({ dependencies, isLoggedIn: user != null })
                }

                private async observeAuthChanges({ auth }: Services) {
                    for await (const user of authChanges(auth)) {
                        this.setState({ isLoggedIn: user != null })
                    }
                }

                render() {
                    if (!this.state.dependencies) {
                        return <LoadingScreen />
                    }

                    return (
                        <ThemeProvider theme={theme}>
                            {containerCreator(this.state)}
                        </ThemeProvider>
                    )
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
