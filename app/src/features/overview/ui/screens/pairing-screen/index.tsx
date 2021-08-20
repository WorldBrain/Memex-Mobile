import React from 'react'
import { Alert } from 'react-native'

import SyncSuccess from '../../components/sync-success-stage'
import { MainNavProps, UIServices } from 'src/ui/types'
import { storageKeys } from '../../../../../../app.json'

interface Props extends MainNavProps<'Pairing'> {
    services: UIServices<'localStorage'>
}

export default class RePairScreen extends React.PureComponent<Props> {
    private handleRePairConfirmation = async () => {
        await this.props.services.localStorage.clear(storageKeys.syncKey)
        this.props.navigation.navigate('CloudSync')
    }

    private handleRePairChoice = () => {
        Alert.alert('Are you sure you want to do that?', `You can't go back`, [
            { text: 'Cancel' },
            { text: 'OK', onPress: this.handleRePairConfirmation },
        ])
    }

    private handleBackPress = () => {
        this.props.navigation.navigate('Dashboard')
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
