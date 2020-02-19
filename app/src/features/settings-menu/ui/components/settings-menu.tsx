import React from 'react'
import { View } from 'react-native'

import styles from './settings-menu.styles'
import DashboardNav from 'src/features/overview/ui/components/dashboard-navigation'
import Button from 'src/ui/components/memex-btn'

export interface Props {
    onExitPress: () => void
    onDevicePairedPress: () => void
    onSyncPress: () => void
    isPaired: boolean
    isSyncing: boolean
    versionCode: string
}

const SettingsMenu: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <DashboardNav onRightIconPress={props.onExitPress} icon="exit">
            Menu
        </DashboardNav>
        <View style={styles.mainContainer}>
            <Button
                title={props.isPaired ? 'Sync Now' : 'Setup Sync With Computer'}
                onPress={props.onSyncPress}
                isLoading={props.isSyncing}
                secondary
            />
            <View style={styles.linksContainer}>{props.children}</View>
        </View>
        <View style={styles.footerContainer}>
            {props.isPaired && (
                <Button
                    title="Device paired"
                    onPress={props.onDevicePairedPress}
                />
            )}
        </View>
    </View>
)

export default SettingsMenu
