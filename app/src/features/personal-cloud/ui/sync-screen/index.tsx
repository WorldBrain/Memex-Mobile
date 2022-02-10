import React from 'react'
import { Image, View, Text, Linking } from 'react-native'

import { supportEmail } from '../../../../../app.json'
import { StatefulUIElement } from 'src/ui/types'
import SyncScreenLogic, { State, Event, Props as LogicProps } from './logic'
import EmptyLayout from 'src/ui/layouts/empty'
import styles from './styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import Button from 'src/ui/components/memex-btn'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'
import * as icons from 'src/ui/components/icons/icons-list'
import { PrimaryAction } from 'src/ui/utils/ActionButtons'

interface Props extends LogicProps {}

export default class CloudSyncScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, new SyncScreenLogic(props))
    }

    private handleSyncErrorReport = () => {
        const subject = `SYNC ERROR: Initial sync`
        const body = `
        I encountered an error in the process of initial sync when using Memex Go.

        Below is the error message:

        ${this.state.errorMessage!}
        `

        return Linking.openURL(
            `mailto:${supportEmail}?subject=${subject}&body=${body}`,
        )
    }

    private renderSyncingScreen() {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                }}
            >
                <LoadingBalls />
                <View style={styles.header}>
                    <HeadingText style={styles.headerText}>
                        Syncing your data
                    </HeadingText>
                </View>
                <View style={styles.body}>
                    <SecondaryText style={styles.bodyText}>
                        This can take a while. Please leave your app open and
                        your device on charge.
                    </SecondaryText>
                </View>
            </View>
        )
    }

    private renderSyncingError() {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    display: 'flex',
                }}
            >
                <View style={styles.contentBox}>
                    <Image
                        resizeMode="contain"
                        style={styles.logoIcon}
                        source={require('../../../../ui/assets/MemexIcon.png')}
                    />
                    <View style={styles.header}>
                        <HeadingText style={styles.headerText}>
                            Error syncing data
                        </HeadingText>
                    </View>
                    <View style={styles.body}>
                        <SecondaryText style={styles.bodyText}>
                            Restart the app and try again.
                        </SecondaryText>
                    </View>
                    <View style={styles.body}>
                        <SecondaryText style={styles.bodyText}>
                            If sync continues to fail,{' '}
                            <TertiaryText
                                style={[styles.bodyText, styles.supportLink]}
                                onPress={this.handleSyncErrorReport}
                            >
                                contact support
                            </TertiaryText>
                        </SecondaryText>
                    </View>
                </View>
            </View>
        )
    }

    private renderSyncingComplete() {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    display: 'flex',
                }}
            >
                <View style={styles.contentBox}>
                    <SectionCircle>
                        <Icon
                            icon={icons.Alert}
                            heightAndWidth={'30px'}
                            color="purple"
                        />
                    </SectionCircle>
                    <View style={styles.header}>
                        <HeadingText>Sync successful</HeadingText>
                    </View>
                    <View style={styles.body}>
                        <SecondaryText>
                            If you see no data in the dashboard, make sure you
                            synced on at least one of your other devices first
                            then restart the app.
                        </SecondaryText>
                    </View>
                </View>
                <PrimaryAction
                    label="Go to Dashboard"
                    onPress={() => this.processEvent('goToDashboard', null)}
                />
            </View>
        )
    }

    render() {
        switch (this.state.syncState) {
            case 'running':
                return this.renderSyncingScreen()
            case 'error':
                return this.renderSyncingError()
            case 'done':
                return this.renderSyncingComplete()
            default:
                return (
                    <EmptyLayout>
                        <LoadingBalls />
                    </EmptyLayout>
                )
        }
    }
}

const HeadingText = styled.Text`
    color: ${(props) => props.theme.colors.darkerText};
    font-size: 24px;
    font-weight: 800;
    text-align: center;
    margin-bottom: 10px;
`

const SecondaryText = styled.Text`
    color: ${(props) => props.theme.colors.lighterText};
    font-size: 20px;
    font-weight: 400;
    text-align: center;
    margin-bottom: 10px;
    padding: 0 20px;
`

const TertiaryText = styled.Text`
    color: ${(props) => props.theme.colors.purple};
`

const SectionCircle = styled.View`
    background: ${(props) => props.theme.colors.backgroundHighlight};
    border-radius: 100px;
    height: 60px;
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
`
