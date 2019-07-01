import {AppRegistry} from 'react-native'
import {name as appName} from '../../app.json'

import { Storage } from 'src/storage/types';
import { Services } from 'src/services/types';

import React, { Component } from 'react';
import { View, Text } from 'react-native';

import Overview from 'src/features/overview/ui/screens/overview'
import ShareModal from 'src/features/example/ui/screens/share-modal'

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

                return <Overview />
            }
        }

        AppRegistry.registerComponent(appName, () => AppContainer)
        AppRegistry.registerComponent('MemexShare', () => ShareModal)
    }

    initialize(options : { dependencies : UIDependencies }) {
        this.setupResolve(options.dependencies)
    }
}
