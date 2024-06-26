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
import { SectionCircle } from 'src/ui/utils/SectionCircle'

interface Props extends LogicProps {}

const MemexLogoFile = require('src/ui/assets/MemexIcon.png')

const calcPercComplete = ({
    totalDownloads,
    downloadProgress,
}: State): number => Math.trunc(100 * (downloadProgress! / totalDownloads!))

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
        if (
            this.state.totalDownloads == null ||
            this.state.downloadProgress == null
        ) {
            return null
        }
        return (
            <SyncInfoContainer>
                <InfoText>
                    {this.state.totalDownloads != null && (
                        <>
                            {this.state.downloadProgress &&
                                this.state.downloadProgress}{' '}
                            / {this.state.totalDownloads}
                        </>
                    )}
                </InfoText>
                <ProgressExplainer>Changes already synced</ProgressExplainer>
                <ProgressBarContainer>
                    <ProgressBar>
                        <ProgressBarInner
                            percentageComplete={calcPercComplete(this.state)}
                        />
                    </ProgressBar>
                    <ProgressBarHelperTextContainer>
                        <ProgressBarHelperTextLeft>
                            Progress
                        </ProgressBarHelperTextLeft>
                        <ProgressBarHelperTextRight>
                            {calcPercComplete(this.state)}%
                        </ProgressBarHelperTextRight>
                    </ProgressBarHelperTextContainer>
                </ProgressBarContainer>
            </SyncInfoContainer>
        )
    }

    private renderSyncingScreen() {
        return (
            <Container>
                <InnerContainer>
                    {this.state.totalDownloads === null ? (
                        <SyncPreparationBox>
                            <LoadingBalls />
                            <HeadingText>Preparing Sync</HeadingText>
                        </SyncPreparationBox>
                    ) : (
                        <>
                            <HeadingText>Sync in Progress</HeadingText>
                            {this.renderStats()}
                        </>
                    )}
                    <SecondaryText>
                        Sync only runs with the app open.
                    </SecondaryText>
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
                        type="primary"
                        size="medium"
                    />
                </View>
                <ContactContainer>
                    <SecondaryText>Continues to fail?</SecondaryText>
                    <PrimaryAction
                        label="Contact Support"
                        onPress={() => {
                            Linking.openURL('mailto:support@memex.garden')
                        }}
                        type="secondary"
                        size="medium"
                    />
                </ContactContainer>
            </Container>
        )
    }

    private renderSyncingComplete() {
        return (
            <Container>
                {SectionCircle(60, icons.CheckMark)}
                <View>
                    <HeadingText>Sync successful</HeadingText>
                </View>
                {!this.props.route.params?.shouldRetrospectiveSync && (
                    <View>
                        <SecondaryText>
                            If you see no data in the dashboard, make sure you
                            synced on at least one of your other devices first
                            then restart the app.
                        </SecondaryText>
                    </View>
                )}
                <PrimaryAction
                    label="Go to Dashboard"
                    onPress={() => this.processEvent('goToDashboard', null)}
                    type="primary"
                    size="medium"
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

const SyncPreparationBox = styled.View`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 150px;
`

const ProgressBarContainer = styled.View`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 250px;
`

const ProgressBar = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background: ${(props) => props.theme.colors.greyScale3};
    border-radius: 5px;
    height: 6px;
    width: 100%;
    margin-bottom: 5px;
`

const ProgressBarInner = styled.View<{
    percentageComplete: number
}>`
    width: ${(props) => props.percentageComplete}%;
    border-radius: 5px;
    height: 6px;
    background: ${(props) => props.theme.colors.prime1};
`

const ProgressBarHelperTextContainer = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`

const ProgressBarHelperTextLeft = styled.Text`
    display: flex;
    font-size: 14px;
    color: ${(props) => props.theme.colors.greyScale4};
    font-family: 'Satoshi';
`

const ProgressBarHelperTextRight = styled.Text`
    display: flex;
    font-size: 14px;
    color: ${(props) => props.theme.colors.white};
    font-family: 'Satoshi';
`

const ContactContainer = styled.View`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    margin-top: 35px;
`

const HeadingText = styled.Text`
    color: ${(props) => props.theme.colors.white};
    font-size: 20px;
    font-weight: 500;
    text-align: center;
    margin-bottom: 20px;
    margin-top: 30px;
    font-family: 'Satoshi';
`

const SecondaryText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale5};
    font-size: 16px;
    font-weight: 300;
    text-align: center;
    padding: 0 20px;
    max-width: 600px;
    margin: 0px 0 40px 0px;
    font-family: 'Satoshi';
`
const ProgressExplainer = styled.Text`
    color: ${(props) => props.theme.colors.greyScale6};
    font-size: 14px;
    font-weight: 400;
    text-align: center;
    margin-bottom: 10px;
    padding: 0 20px;
    max-width: 600px;
    margin: 15px 0 30px 0px;
    font-family: 'Satoshi';
`

const Container = styled.SafeAreaView`
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    background: ${(props) => props.theme.colors.black};
`

const InnerContainer = styled.View`
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
`

const MemexLogo = styled.Image`
    height: 60px;
    display: flex;
`

const InfoText = styled.Text`
    font-weight: bold;
    color: ${(props) => props.theme.colors.prime1};
    font-size: 26px;
    font-family: 'Satoshi';
`

const SyncInfoContainer = styled.View`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 50px;
    padding: 30px;
    border-radius: 8px;
    background: ${(props) => props.theme.colors.greyScale1};
`

const Spacer = styled.View`
    height: 15px;
`
