import React from 'react'
import { View, Text } from 'react-native'

import styles from './settings-menu.styles'
import Navigation from 'src/features/overview/ui/components/navigation'
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
        <Navigation onSettingsPress={props.onExitPress} icon="exit">
            Menu
        </Navigation>
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
            <Text style={styles.versionText}>Version {props.versionCode}</Text>
        </View>
    </View>
)

export default SettingsMenu
