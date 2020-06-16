import React from 'react'
import { Alert } from 'react-native'

import SyncSuccess from 'src/features/sync/ui/components/sync-success-stage'
import { storageKeys } from '../../../../../../app.json'
import {
    NavigationScreen,
    NavigationProps,
    UIServices,
    UIStorageModules,
} from 'src/ui/types'

interface Props extends NavigationProps {
    services: UIServices<'localStorage'>
    storage: UIStorageModules<'syncInfo'>
}

export default class RePairScreen extends NavigationScreen<Props, {}, Event> {
    private handleRePairConfirmation = async () => {
        const { services, storage, navigation } = this.props

        await services.localStorage.clear(storageKeys.syncKey)
        await storage.modules.syncInfo.removeAllDevices()
        navigation.navigate('Sync')
    }

    private handleRePairChoice = () => {
        Alert.alert('Are you sure you want to do that?', `You can't go back`, [
            { text: 'Cancel' },
            { text: 'OK', onPress: this.handleRePairConfirmation },
        ])
    }

    private handleBackPress = () => {
        this.props.navigation.navigate('Overview')
    }

    render() {
        return (
            <SyncSuccess
                allowRePairing
                onBtnPress={this.handleRePairChoice}
                onBackBtnPress={this.handleBackPress}
            />
        )
    }
}
