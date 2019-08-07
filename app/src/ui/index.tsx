import React, { Component } from 'react'
import { AppRegistry, View, Text } from 'react-native'

import { name as appName } from '../../app.json'
import createApp from './navigation'
import ShareModal from 'src/features/page-share/ui/screens/share-modal'
import { UIDependencies } from './types'

export class UI {
    private setupResolve!: (dependencies: UIDependencies) => void

    constructor() {
        const setupPromise = new Promise<UIDependencies>((resolve, reject) => {
            this.setupResolve = resolve
        })

        interface State {
            dependencies: UIDependencies | null
        }

        class AppContainer extends Component<{}, State> {
            state: State = {
                dependencies: null,
            }

            async componentDidMount() {
                this.setState({ dependencies: await setupPromise })
            }

            componentWillUnmount() {
                console.log('unmounting')
            }

            private renderMainNavContainer() {
                const AppContainer = createApp(this.state.dependencies!)
                return <AppContainer />
            }

            render() {
                if (!this.state.dependencies) {
                    return (
                        <View>
                            <Text>Loading!?!!</Text>
                        </View>
                    )
                }

                return this.renderMainNavContainer()
            }
        }

        AppRegistry.registerComponent(appName, () => AppContainer)
        AppRegistry.registerComponent('MemexShare', () => ShareModal)
    }

    initialize(options: { dependencies: UIDependencies }) {
        this.setupResolve(options.dependencies)
    }
}
