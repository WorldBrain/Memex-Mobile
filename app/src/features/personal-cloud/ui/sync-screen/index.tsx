import React from 'react'
import { Image, View, Text, Linking } from 'react-native'

import { supportEmail } from '../../../../../app.json'
import { StatefulUIElement } from 'src/ui/types'
import SyncScreenLogic, { State, Event, Props as LogicProps } from './logic'
import EmptyLayout from 'src/ui/layouts/empty'
import styles from './styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import Button from 'src/ui/components/memex-btn'

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
            <EmptyLayout>
                <Image
                    resizeMode="contain"
                    style={styles.logoIcon}
                    source={require('../../../../ui/assets/MemexIcon.png')}
                />
                <LoadingBalls />
                <View style={styles.header}>
                    <Text style={styles.headerText}>Syncing your data</Text>
                </View>
                <View style={styles.body}>
                    <Text style={styles.bodyText}>
                        This can take a while. Please leave your app open and
                        your device on charge.
                    </Text>
                </View>
            </EmptyLayout>
        )
    }

    private renderSyncingError() {
        return (
            <EmptyLayout>
                <Image
                    resizeMode="contain"
                    style={styles.logoIcon}
                    source={require('../../../../ui/assets/MemexIcon.png')}
                />
                <View style={styles.header}>
                    <Text style={styles.headerText}>Error syncing data</Text>
                </View>
                <View style={styles.body}>
                    <Text style={styles.bodyText}>
                        Restart the app and try again.
                    </Text>
                </View>
                <View style={styles.body}>
                    <Text style={styles.bodyText}>
                        If sync continues to fail,{' '}
                    </Text>
                    <Text
                        style={[styles.bodyText, styles.supportLink]}
                        onPress={this.handleSyncErrorReport}
                    >
                        contact support
                    </Text>
                </View>
            </EmptyLayout>
        )
    }

    private renderSyncingComplete() {
        return (
            <EmptyLayout>
                <Image
                    resizeMode="contain"
                    style={styles.logoIcon}
                    source={require('../assets/successIcon.png')}
                />
                <View style={styles.header}>
                    <Text style={styles.headerText}>Sync successful</Text>
                </View>
                <View style={styles.body}>
                    <Text style={styles.bodyText}>
                        If you see no data in the dashboard, make sure you
                        synced on at least one of your other devices first then
                        restart the app.
                    </Text>
                </View>
                <Button
                    title="Go to Dashboard"
                    onPress={() => this.processEvent('goToDashboard', null)}
                />
            </EmptyLayout>
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
