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
import { PrimaryAction, SecondaryAction } from 'src/ui/utils/ActionButtons'

interface Props extends LogicProps {}

const MemexLogoFile = require('src/ui/assets/MemexIcon.png')

const calcPercComplete = ({
    totalDownloads,
    pendingDownloads,
}: State): number => Math.trunc(100 * (1 - pendingDownloads! / totalDownloads!))

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

    private renderStats() {
        // if (this.props.route.params?.shouldRetrospectiveSync) {
        //     return null
        // }

        if (this.state.totalDownloads) {
            return (
                <SyncInfoContainer>
                    <InfoTextProgress>
                        {this.state.totalDownloads == null
                            ? '...'
                            : calcPercComplete(this.state)}
                        %
                    </InfoTextProgress>
                    <Spacer />
                    <SecondaryText>
                        Changes left to Sync: {'\n'}
                        <InfoText>
                            {this.state.totalDownloads == null
                                ? '...'
                                : this.state.pendingDownloads}{' '}
                            <SecondaryText>of</SecondaryText>{' '}
                            {this.state.totalDownloads ?? '...'}
                        </InfoText>
                    </SecondaryText>
                    <SecondaryText>
                        Sync only runs with the app open.
                    </SecondaryText>
                </SyncInfoContainer>
            )
        } else {
            return <SyncInfoContainer />
        }
    }

    private renderSyncingScreen() {
        return (
            <Container>
                <InnerContainer>
                    <LoadingBalls size={40} />
                    {this.state.totalDownloads === null ? (
                        <HeadingText>Preparing Sync</HeadingText>
                    ) : (
                        <HeadingText>Sync in Progress</HeadingText>
                    )}
                    {this.renderStats()}
                </InnerContainer>
            </Container>
        )
    }

    private renderSyncingError() {
        return (
            <Container>
                <MemexLogo resizeMode="contain" source={MemexLogoFile} />
                <View>
                    <HeadingText>Error syncing data</HeadingText>
                </View>
                <View>
                    <PrimaryAction
                        label="Retry"
                        onPress={() => this.processEvent('retrySync', null)}
                    />
                </View>
                <ContactContainer>
                    <SecondaryText>Continues to fail?</SecondaryText>
                    <SecondaryAction
                        label="Contact Support"
                        onPress={() => {
                            Linking.openURL('mailto:support@memex.garden')
                        }}
                    />
                </ContactContainer>
            </Container>
        )
    }

    private renderSyncingComplete() {
        return (
            <Container>
                <SectionCircle>
                    <Icon
                        icon={icons.CheckMark}
                        heightAndWidth={'30px'}
                        color="purple"
                        strokeWidth="2px"
                    />
                </SectionCircle>
                <View>
                    <HeadingText>Sync successful</HeadingText>
                </View>
                <View>
                    {!this.props.route.params?.shouldRetrospectiveSync && (
                        <SecondaryText>
                            If you see no data in the dashboard, make sure you
                            synced on at least one of your other devices first
                            then restart the app.
                        </SecondaryText>
                    )}
                </View>
                <PrimaryAction
                    label="Go to Dashboard"
                    onPress={() => this.processEvent('goToDashboard', null)}
                />
            </Container>
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

const ContactContainer = styled.View`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    margin-top: 35px;
`

const HeadingText = styled.Text`
    color: ${(props) => props.theme.colors.darkerText};
    font-size: 24px;
    font-weight: 800;
    text-align: center;
    margin-bottom: 20px;
    margin-top: 20px;
`

const SecondaryText = styled.Text`
    color: ${(props) => props.theme.colors.lighterText};
    font-size: 18px;
    font-weight: 400;
    text-align: center;
    margin-bottom: 10px;
    padding: 0 20px;
    max-width: 600px;
    margin-bottom: 30px;
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

const Container = styled.SafeAreaView`
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
`

const InnerContainer = styled.View`
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 60%;
    width: 100%;
`

const MemexLogo = styled.Image`
    height: 60px;
    display: flex;
`

const InfoText = styled.Text`
    font-weight: bold;
    color: ${(props) => props.theme.colors.purple};
`

const InfoTextProgress = styled.Text`
    font-weight: bold;
    color: ${(props) => props.theme.colors.purple};
    font-size: 22px;
    margin: -10px 0 10px 0%;
`

const SyncInfoContainer = styled.View`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 50px;
    height: 150px;
`

const Spacer = styled.View`
    height: 15px;
`
