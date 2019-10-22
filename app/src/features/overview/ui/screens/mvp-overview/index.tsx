import React from 'react'
import { View, Text, Linking } from 'react-native'

import { version, storageKeys } from '../../../../../../app.json'
import EmptyLayout from 'src/ui/layouts/empty'
import Button from 'src/ui/components/memex-btn'
import { NavigationScreen, NavigationProps } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import styles from './styles'

interface Props extends NavigationProps {}

export default class MVPOverviewMenu extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    componentDidMount() {
        this.navToOnboardingIfNeeded()
        this.checkSyncState()
    }

    private async checkSyncState() {
        const syncKey = await this.props.services.localStorage.get<string>(
            storageKeys.syncKey,
        )

        if (syncKey != null) {
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

    private handleRoadmapPress = () => Linking.openURL('https://worldbrain.io')

    private handleBugReportPress = () =>
        Linking.openURL('https://worldbrain.io')

    render() {
        return (
            <EmptyLayout>
                <View style={styles.mainContent}>
                    <View style={styles.memexLogo} />
                    <View style={styles.btnsContainer}>
                        <Button
                            title="View Tutorial"
                            onPress={this.handleTutorialPress}
                            style={styles.btn}
                        />
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
                    </View>
                </View>
                <Text style={styles.versionText}>Version {version}</Text>
            </EmptyLayout>
        )
    }
}
