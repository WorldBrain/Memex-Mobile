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
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'
import Link from 'src/ui/components/link'
import { PrimaryAction } from 'src/ui/utils/ActionButtons'

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
                <SettingsContainer>
                    <SettingsEntryRow
                        onPress={() =>
                            navigation.navigate('Onboarding', {
                                redoOnboarding: true,
                            })
                        }
                    >
                        <Icon icon={icons.HelpIcon} heightAndWidth={'24px'} />
                        <SettingsEntryText>Tutorial</SettingsEntryText>
                    </SettingsEntryRow>
                    <Link
                        href={
                            'https://www.notion.so/worldbrain/Release-Notes-Roadmap-262a367f7a2a48ff8115d2c71f700c14'
                        }
                    >
                        <SettingsEntryRowLink>
                            <Icon icon={icons.Clock} heightAndWidth={'24px'} />
                            <SettingsEntryText>
                                Changelog & Feature Roadmap
                            </SettingsEntryText>
                        </SettingsEntryRowLink>
                    </Link>
                    <Link href={'https://links.memex.garden/feedback'}>
                        <SettingsEntryRowLink>
                            <Icon
                                icon={icons.SadFace}
                                heightAndWidth={'24px'}
                            />
                            <SettingsEntryText>
                                Bugs & Feature Requests
                            </SettingsEntryText>
                        </SettingsEntryRowLink>
                    </Link>
                    <Link
                        href={
                            'mailto:support@memex.garden?subject=Delete%20my%20account&body=Please%20delete%20my%20account.'
                        }
                    >
                        <SettingsEntryRowLink>
                            <Icon icon={icons.Trash} heightAndWidth={'24px'} />
                            <SettingsEntryText>
                                Delete Account
                            </SettingsEntryText>
                        </SettingsEntryRowLink>
                    </Link>
                    <SettingsEntryRow
                        onPress={() => this.processEvent('logout', null)}
                    >
                        <Icon icon={icons.LogOut} heightAndWidth={'24px'} />
                        <SettingsEntryText>Log out of Memex</SettingsEntryText>
                    </SettingsEntryRow>
                </SettingsContainer>
            </SettingsMenu>
        )
    }
}

const SettingsContainer = styled.View`
    height: 600px;
    max-width: 600px;
    width: 100%;
    min-width: 250px;
`

const SettingsEntryText = styled.Text`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start
    color: ${(props) => props.theme.colors.greyScale5};
    font-size: 14px;
    margin-left: 10px;
`

const SettingsEntryRow = styled.TouchableOpacity`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start
    height: 60px;
    border-style: solid;
    border-bottom-width: 1px;
    border-color: ${(props) => props.theme.colors.greyScale5};
`

const SettingsEntryRowLink = styled.View`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start
    height: 60px;
    border-style: solid;
    border-bottom-width: 1px;
    border-color: ${(props) => props.theme.colors.greyScale5};
`
