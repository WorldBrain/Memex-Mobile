import React from 'react'
import { View, Text } from 'react-native'

import styles from './settings-menu.styles'
import DashboardNav from 'src/features/overview/ui/components/dashboard-navigation'
import Button from 'src/ui/components/memex-btn'

export interface Props {
    isPaired: boolean
    isSyncing: boolean
    hasSuccessfullySynced: boolean
    versionCode: string
    syncErrorMessage?: string
    onSyncPress: () => void
    onExitMenuPress: () => void
    onExitErrorPress: () => void
    onDevicePairedPress: () => void
}

class SettingsMenu extends React.PureComponent<Props> {
    get syncButtonStyles(): string | undefined {
        if (this.props.hasSuccessfullySynced) {
            return styles.syncButtonSuccess
        }
    }

    get syncButtonText(): string {
        if (this.props.hasSuccessfullySynced) {
            return 'Synced!'
        }

        return this.props.isPaired ? 'Sync Now' : 'Setup Sync With Computer'
    }

    renderSyncError() {
        return (
            <>
                <DashboardNav
                    onRightIconPress={this.props.onExitErrorPress}
                    titleText="Sync Error"
                    icon="exit"
                />
                <View style={styles.mainContainer}>
                    <Text style={styles.mainText}>
                        There was an issue with your sync
                    </Text>
                    <Text style={styles.errMessageTitle}>Error message:</Text>
                    <Text style={styles.errMessage}>
                        {this.props.syncErrorMessage}
                    </Text>
                </View>
                <View style={styles.footerContainer}>
                    <Button
                        title="Retry Sync"
                        onPress={this.props.onSyncPress}
                        isLoading={this.props.isSyncing}
                        secondary
                    />
                </View>
            </>
        )
    }

    renderMenu() {
        return (
            <>
                <DashboardNav
                    onRightIconPress={this.props.onExitMenuPress}
                    icon="exit"
                    titleText="Menu"
                />
                <View style={styles.mainContainer}>
                    <Button
                        secondary
                        title={this.syncButtonText}
                        style={this.syncButtonStyles}
                        onPress={this.props.onSyncPress}
                        isLoading={this.props.isSyncing}
                    />
                    <View style={styles.linksContainer}>
                        {this.props.children}
                    </View>
                </View>
                <View style={styles.footerContainer}>
                    {this.props.isPaired && (
                        <Button
                            title="Device paired"
                            onPress={this.props.onDevicePairedPress}
                        />
                    )}
                </View>
            </>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {this.props.syncErrorMessage
                    ? this.renderSyncError()
                    : this.renderMenu()}
            </View>
        )
    }
}

export default SettingsMenu
