import React from 'react'

import { version } from '../../../../../../app.json'
import { NavigationScreen, NavigationProps, UIServices } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import SettingsMenu from '../../components/settings-menu'
import SettingsLink from '../../components/settings-link'

interface Props extends NavigationProps {
    services: UIServices<'localStorage' | 'sync'>
}

export default class SettingsMenuScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private handleSyncPress = () => {
        if (this.state.isSynced) {
            this.processEvent('syncNow', {})
        } else {
            this.props.navigation.navigate('Sync')
        }
    }

    private navigateTo = (
        route: 'Pairing' | 'Overview' | 'Onboarding',
    ) => () => {
        this.props.navigation.navigate(route)
    }

    render() {
        return (
            <SettingsMenu
                isPaired={this.state.isSynced}
                versionCode={version}
                onDevicePairedPress={this.navigateTo('Pairing')}
                onExitPress={this.navigateTo('Overview')}
                onSyncPress={this.handleSyncPress}
                isSyncing={this.state.syncState === 'running'}
            >
                <SettingsLink onPress={this.navigateTo('Onboarding')}>
                    Tutorial
                </SettingsLink>
                <SettingsLink onPress={this.navigateTo('Onboarding')}>
                    Feature Roadmap
                </SettingsLink>
                <SettingsLink
                    onPress={this.navigateTo('Onboarding')}
                    skipBottomBorder
                >
                    Report Bugs
                </SettingsLink>
            </SettingsMenu>
        )
    }
}
