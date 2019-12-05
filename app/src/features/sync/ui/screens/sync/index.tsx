import React from 'react'
import { Text } from 'react-native'

import { NavigationScreen, NavigationProps, UIServices } from 'src/ui/types'
import SyncScreenLogic, {
    SyncScreenState,
    SyncScreenEvent,
    SyncScreenDependencies,
} from './logic'
import SetupStage from '../../components/sync-setup-stage'
import LoadingStage from '../../components/sync-loading-stage'
import SuccessStage from '../../components/sync-success-stage'
import ScanQRStage from '../../components/sync-scan-qr-stage'

export default class SyncScreen extends NavigationScreen<
    SyncScreenDependencies,
    SyncScreenState,
    SyncScreenEvent
> {
    constructor(props: SyncScreenDependencies) {
        super(props, { logic: new SyncScreenLogic(props) })
    }

    render() {
        switch (this.state.status) {
            case 'scanning':
                return (
                    <ScanQRStage
                        onQRRead={qrEvent =>
                            this.processEvent('doSync', {
                                initialMessage: qrEvent.data,
                            })
                        }
                        onSkipBtnPress={() => this.processEvent('skipSync', {})}
                        onManualInputSubmit={() =>
                            this.processEvent('doSync', {
                                initialMessage: this.state.manualInputValue,
                            })
                        }
                        onManualInputChange={text =>
                            this.processEvent('setManualInputText', { text })
                        }
                        manualInputValue={this.state.manualInputValue}
                        debug={__DEV__}
                    />
                )
            case 'syncing':
                return <LoadingStage />
            case 'success':
                return (
                    <SuccessStage
                        onBtnPress={() =>
                            this.processEvent('confirmSuccess', {})
                        }
                    />
                )
            case 'failure':
                return <Text>{this.state.errMsg}</Text>
            case 'setup':
                return (
                    <SetupStage
                        onBtnPress={() =>
                            this.processEvent('startScanning', {})
                        }
                    />
                )
            default:
                throw new Error(
                    `Unknown sync screen status: ${this.state.status}`,
                )
        }
    }
}
