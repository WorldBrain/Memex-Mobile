import React from 'react'
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake'

import { NavigationScreen } from 'src/ui/types'
import Logic, { SyncScreenState, SyncScreenEvent, Props } from './logic'
import SetupStage from '../../components/sync-setup-stage'
import LoadingStage from '../../components/sync-loading-stage'
import InfoStage from '../../components/sync-info-stage'
import SuccessStage from '../../components/sync-success-stage'
import ErrorStage from '../../components/sync-error-stage'
import ScanQRStage from '../../components/sync-scan-qr-stage'

export default class SyncScreen extends NavigationScreen<
    Props,
    SyncScreenState,
    SyncScreenEvent
> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    static defaultProps: Partial<Props> = {
        syncStallTimeout: 1000 * 60 * 20,
    }

    private handleCancelBtnPress = () => {
        this.props.navigation.navigate('Overview')
    }

    handleDoSync = async ({ initialMessage }: { initialMessage: string }) => {
        activateKeepAwake()
        await this.processEvent('doSync', { initialMessage })
        deactivateKeepAwake()
    }

    render() {
        switch (this.state.status) {
            case 'scanning':
                return (
                    <ScanQRStage
                        onCancelBtnPress={this.handleCancelBtnPress}
                        onQRRead={qrEvent =>
                            this.handleDoSync({ initialMessage: qrEvent.data })
                        }
                        onBtnPress={() => this.processEvent('skipSync', {})}
                        onManualInputSubmit={() =>
                            this.handleDoSync({
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
                return (
                    <LoadingStage
                        __backToOverview={this.handleCancelBtnPress}
                    />
                )
            case 'success':
                return (
                    <SuccessStage
                        onCancelBtnPress={this.handleCancelBtnPress}
                        onBtnPress={() =>
                            this.processEvent('confirmSuccess', {})
                        }
                    />
                )
            case 'failure':
                return (
                    <ErrorStage
                        onCancelBtnPress={this.handleCancelBtnPress}
                        onSupportBtnPress={this.handleCancelBtnPress}
                        errorText={
                            this.state.errMsg || 'Something has gone wrong'
                        }
                        onBtnPress={() => undefined}
                    />
                )
            case 'info':
                return (
                    <InfoStage
                        onCancelBtnPress={this.handleCancelBtnPress}
                        onBtnPress={() =>
                            this.processEvent('setSyncStatus', {
                                value: 'scanning',
                            })
                        }
                    />
                )
            case 'setup':
                return (
                    <SetupStage
                        onCancelBtnPress={this.handleCancelBtnPress}
                        onBtnPress={() =>
                            this.processEvent('setSyncStatus', {
                                value: 'info',
                            })
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
