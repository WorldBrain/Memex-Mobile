import React, { Component } from 'react'
import { AppRegistry, Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { userChanges } from '@worldbrain/memex-common/lib/authentication/utils'
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
import { SheetProvider } from 'react-native-actions-sheet'

export class UI {
    private setupResolve!: (dependencies: UIDependencies) => void

    constructor() {
        const entireScreenWidth = Dimensions.get('screen').width

        EStyleSheet.build({
            $textColor: '#3a2f45',
            $greenColor: theme.colors.greyScale1,
            $purpleColor: '#72727f',
            $rem: entireScreenWidth / 30,
        })

        const setupPromise = new Promise<UIDependencies>((resolve) => {
            this.setupResolve = resolve
        })

        const setupContainerComponent = (
            containerCreator: NavigationContainerFactory,
            componentName: string,
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
                    for await (const user of userChanges(auth)) {
                        this.setState({ isLoggedIn: user != null })
                    }
                }

                private renderActionSheetProvider() {
                    // Share ext on Android is essentially just another screen of the main app, thus
                    //  doesn't need another SheetProvider (else weird double-rendering stuff happens)
                    if (
                        Platform.OS === 'android' &&
                        componentName === shareExtName
                    ) {
                        return null
                    }

                    // Note this isn't the intended way to use this component, but wrapping the app conflicted
                    //  with React Navigation's provider comps and still seems to work fine like this
                    return (
                        <SheetProvider>
                            <></>
                        </SheetProvider>
                    )
                }

                render() {
                    if (!this.state.dependencies) {
                        return <LoadingScreen />
                    }

                    return (
                        <ThemeProvider theme={theme}>
                            {containerCreator(this.state)}
                            {this.renderActionSheetProvider()}
                        </ThemeProvider>
                    )
                }
            }

        AppRegistry.registerComponent(
            appName,
            setupContainerComponent(createMainNavigator, appName),
        )

        AppRegistry.registerComponent(
            shareExtName,
            setupContainerComponent(createShareNavigator, shareExtName),
        )
    }

    initialize(options: { dependencies: UIDependencies }) {
        this.setupResolve(options.dependencies)
    }
}
