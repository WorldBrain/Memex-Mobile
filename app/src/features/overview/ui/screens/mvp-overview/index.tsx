import React from 'react'
import { View, Text, Linking, Image } from 'react-native'

import { storageKeys } from '../../../../../../app.json'
import EmptyLayout from 'src/ui/layouts/empty'
import Button from 'src/ui/components/memex-btn'
import { MainNavProps, UIServices, StatefulUIElement } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import styles from './styles'
import { isSyncEnabled } from 'src/features/sync/utils'

export interface Props extends MainNavProps<'MVPOverview'> {
    services: UIServices<'localStorage' | 'sync'>
}

export default class MVPOverviewMenu extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, new Logic(props))
    }

    componentDidMount() {
        this.navToOnboardingIfNeeded()
        this.checkSyncState()
    }

    private async checkSyncState() {
        if (await isSyncEnabled(this.props.services)) {
            this.processEvent('setSyncStatus', { value: true })
        }
    }

    private async navToOnboardingIfNeeded() {
        const showOnboarding = await this.props.services.localStorage.get<
            boolean
        >(storageKeys.showOnboarding)

        if (showOnboarding || showOnboarding === null) {
            this.props.navigation.navigate('Onboarding')
        }
    }

    private navToPairingScreen = () => this.props.navigation.navigate('Pairing')
    private navToSyncScreen = () => this.props.navigation.navigate('Sync')

    private handleTutorialPress = () =>
        this.props.navigation.navigate('Onboarding')

    private handleConsolePress = () =>
        this.props.navigation.navigate('DebugConsole')

    private handleRoadmapPress = () => Linking.openURL('https://worldbrain.io')

    private handleBugReportPress = () =>
        Linking.openURL('https://community.worldbrain.io/c/bug-reports')

    private handleSyncNowPress = () => this.processEvent('syncNow', {})

    render() {
        return (
            <EmptyLayout>
                <View style={styles.mainContent}>
                    <View style={styles.memexLogo}>
                        <Image
                            style={styles.logoImg}
                            resizeMode="contain"
                            source={require('../../assets/logo-memex-vertical.png')}
                        />
                    </View>
                    <View style={styles.btnsContainer}>
                        <Button
                            title="2 Step Tutorial"
                            onPress={this.handleTutorialPress}
                            style={styles.btn}
                            secondary
                        />
                        <Button
                            title="Dashboard"
                            onPress={() =>
                                this.props.navigation.navigate('Dashboard')
                            }
                            style={styles.btn}
                            secondary
                        />
                        {this.state.isSynced ? (
                            <Button
                                title="✔ App successfully paired"
                                onPress={this.navToPairingScreen}
                                style={styles.btn}
                            />
                        ) : (
                            <Button
                                title="Pair app with computer"
                                onPress={this.navToSyncScreen}
                                style={styles.btn}
                            />
                        )}
                        <Button
                            title="Feature Roadmap"
                            onPress={this.handleRoadmapPress}
                            style={styles.btn}
                        />
                        <Button
                            title="Report Bugs"
                            onPress={this.handleBugReportPress}
                            style={styles.btn}
                        />
                        <Button
                            title="Sync Now"
                            onPress={this.handleSyncNowPress}
                            style={styles.btn}
                            secondary
                            disabled={!this.state.isSynced}
                            isLoading={this.state.syncState === 'running'}
                        />
                    </View>
                </View>
                <View style={styles.footer}>
                    <Text
                        style={styles.versionText}
                        onPress={this.handleConsolePress}
                    >
                        Debug Console
                    </Text>
                </View>
            </EmptyLayout>
        )
    }
}
