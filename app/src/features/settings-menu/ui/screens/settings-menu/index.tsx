import React from 'react'

import { version } from '../../../../../../app.json'
import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import SettingsMenu from '../../components/settings-menu'
import SettingsLink from '../../components/settings-link'
import OutLink from '../../components/out-link'
import Button from 'src/ui/components/memex-btn'
import { View } from 'react-native'
import styles from '../../components/settings-menu.styles'

export default class SettingsMenuScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, new Logic(props))
    }

    private handleSyncPress = () => {
        if (this.state.isSynced) {
            this.processEvent('syncNow', null)
        } else {
            this.props.navigation.navigate('CloudSync')
        }
    }

    render() {
        const { navigation } = this.props
        return (
            <SettingsMenu
                isPaired={this.state.isSynced}
                versionCode={version}
                onDevicePairedPress={() => navigation.navigate('Pairing')}
                onExitMenuPress={() => navigation.navigate('Dashboard')}
                onSyncPress={this.handleSyncPress}
                isSyncing={this.state.syncState === 'running'}
                syncErrorMessage={this.state.syncErrorMessage}
                onExitErrorPress={() =>
                    this.processEvent('clearSyncError', null)
                }
                hasSuccessfullySynced={this.state.syncState === 'done'}
            >
                <SettingsLink
                    onPress={() =>
                        navigation.navigate('Onboarding', {
                            redoOnboarding: true,
                        })
                    }
                >
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
                {this.state.isLoggedIn && (
                    <View style={styles.logoutButton}>
                        <Button
                            title="Log out"
                            disabled={!this.state.isLoggedIn}
                            onPress={() => this.processEvent('logout', null)}
                        />
                    </View>
                )}
            </SettingsMenu>
        )
    }
}
