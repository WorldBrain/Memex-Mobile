import React from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'

import styles from './navigation.styles'
const ExitIcon = require('../img/closeIcon.png')
const SettingsIcon = require('../img/menuIcon.png')
const MemexIcon = require('../img/MemexIcon.png')

export interface Props {
    onSettingsPress: () => void
    icon: 'exit' | 'settings'
}

const Navigation: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <View style={styles.logoContainer}>
            <Image
                resizeMode="contain"
                source={MemexIcon}
                style={styles.settingsIcon}
            />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.text}>{props.children}</Text>
        </View>
        <TouchableOpacity
            style={styles.btnContainer}
            onPress={props.onSettingsPress}
        >
            {props.icon === 'exit' ? (
                <Image
                    resizeMode="contain"
                    source={ExitIcon}
                    style={styles.settingsIcon}
                />
            ) : (
                <Image
                    resizeMode="contain"
                    source={SettingsIcon}
                    style={styles.settingsIcon}
                />
            )}
        </TouchableOpacity>
    </View>
)

export default Navigation
