import React from 'react'

import { storageKeys } from '../../../../../../app.json'
import { NavigationScreen } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import SetupStage from '../../components/sync-setup-stage'
import LoadingStage from '../../components/sync-loading-stage'
import SuccessStage from '../../components/sync-success-stage'
import ScanQRStage from '../../components/sync-scan-qr-stage'

interface Props {}

export default class SyncScreen extends NavigationScreen<Props, State, Event> {
    static TEST_SYNC_KEY = 'this is a test!'

    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    componentDidMount() {
        this.skipSyncIfNeeded()
    }

    private async skipSyncIfNeeded() {
        const syncKey = await this.props.services.localStorage.get<string>(
            storageKeys.syncKey,
        )

        if (syncKey != null) {
            this.props.navigation.navigate('MVPOverview')
        }
    }

    private handleSyncSuccess = async () => {
        await this.props.services.localStorage.set(
            storageKeys.syncKey,
            SyncScreen.TEST_SYNC_KEY,
        )
        this.processEvent('setSyncStatus', { value: 'success' })
    }

    private handleFakeSync = e => {
        this.processEvent('setSyncStatus', { value: 'syncing' })

        setTimeout(this.handleSyncSuccess, 1500)
    }

    render() {
        switch (this.state.status) {
            case 'scanning':
                return (
                    <ScanQRStage
                        onQRRead={this.handleFakeSync}
                        onBtnPress={this.handleFakeSync}
                    />
                )
            case 'syncing':
                return <LoadingStage />
            case 'success':
                return (
                    <SuccessStage
                        onBtnPress={() =>
                            this.props.navigation.navigate('MVPOverview')
                        }
                    />
                )
            default:
            case 'setup':
                return (
                    <SetupStage
                        onBtnPress={() =>
                            this.processEvent('setSyncStatus', {
                                value: 'scanning',
                            })
                        }
                    />
                )
        }
    }
}
