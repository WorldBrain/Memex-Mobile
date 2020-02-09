import React from 'react'
import {
    View,
    Text,
    GestureResponderEvent,
    TouchableOpacity,
} from 'react-native'

import SettingsIcon from '../img/settings-icon.svg'
import ExitIcon from '../img/exit-icon.svg'
import styles from './navigation.styles'

export interface Props {
    onSettingsPress: (e: GestureResponderEvent) => void
    icon: 'exit' | 'settings'
}

const Navigation: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <View style={styles.emptyView} />
        <Text style={styles.text}>{props.children}</Text>
        <TouchableOpacity
            style={styles.btnContainer}
            onPress={props.onSettingsPress}
        >
            {props.icon === 'exit' ? (
                <ExitIcon style={styles.settingsIcon} />
            ) : (
                <SettingsIcon style={styles.settingsIcon} />
            )}
        </TouchableOpacity>
    </View>
)

export default Navigation
