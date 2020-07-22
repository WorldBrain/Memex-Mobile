import React from 'react'

import { version } from '../../../../../../app.json'
import { NavigationScreen } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import SettingsMenu from '../../components/settings-menu'
import SettingsLink from '../../components/settings-link'
import OutLink from '../../components/out-link'
import MemexButton from 'src/ui/components/memex-btn'

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
            this.processEvent('syncNow', null)
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
                onExitMenuPress={this.navigateTo('Overview')}
                onSyncPress={this.handleSyncPress}
                isSyncing={this.state.syncState === 'running'}
                syncErrorMessage={this.state.syncErrorMessage}
                onExitErrorPress={() =>
                    this.processEvent('clearSyncError', null)
                }
                hasSuccessfullySynced={this.state.syncState === 'done'}
            >
                <SettingsLink onPress={this.navigateTo('Onboarding')}>
                    Tutorial
                </SettingsLink>
                <OutLink
                    url={
                        'https://www.notion.so/worldbrain/Release-Notes-Roadmap-262a367f7a2a48ff8115d2c71f700c14'
                    }
                >
                    Changelog & Feature Roadmap
                </OutLink>
                <OutLink
                    url={'https://community.worldbrain.io/c/bug-reports'}
                    skipBottomBorder
                >
                    Report Bugs
                </OutLink>
                {/* TODO: REMOVE THIS BEFORE MERGE */}
                <MemexButton
                    title="DEBUG: LOG OUT"
                    onPress={() =>
                        (this.props.services as any)['auth'].signOut()
                    }
                />
            </SettingsMenu>
        )
    }
}
