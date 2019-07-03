import React from 'react'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import SetupStage from '../../components/sync-setup-stage'
import LoadingStage from '../../components/sync-loading-stage'
import SuccessStage from '../../components/sync-success-stage'

interface Props {}

export default class ShareModalScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    handleFakeSync = e => {
        this.processEvent('setSyncStatus', { value: 'syncing' })

        setTimeout(
            () => this.processEvent('setSyncStatus', { value: 'success' }),
            1500,
        )
    }

    render() {
        switch (this.state.status) {
            case 'syncing':
                return <LoadingStage />
            case 'success':
                return (
                    <SuccessStage
                        onBtnPress={() =>
                            this.props.navigation.navigate('Overview')
                        }
                    />
                )
            default:
            case 'setup':
                return <SetupStage onBtnPress={this.handleFakeSync} />
        }
    }
}
