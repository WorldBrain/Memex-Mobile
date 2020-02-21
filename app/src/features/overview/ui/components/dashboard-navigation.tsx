import React from 'react'
import { Image, TouchableOpacity } from 'react-native'

import Navigation, { Props as NavProps } from './navigation'
import styles from './dashboard-navigation.styles'
const ExitIcon = require('../img/closeIcon.png')
const SettingsIcon = require('../img/menuIcon.png')
const MemexIcon = require('../img/MemexIcon.png')

export interface Props extends NavProps {
    icon: 'exit' | 'settings'
    onRightIconPress: () => void
}

const DashboardNavigation: React.StatelessComponent<Props> = props => (
    <Navigation
        {...props}
        renderLeftIcon={() => (
            <Image
                resizeMode="contain"
                source={MemexIcon}
                style={styles.logoIcon}
            />
        )}
        renderRightIcon={() => (
            <TouchableOpacity
                style={styles.settingsContainer}
                onPress={props.onRightIconPress}
            >
                <Image
                    resizeMode="contain"
                    source={props.icon === 'exit' ? ExitIcon : SettingsIcon}
                    style={styles.settingsIcon}
                />
            </TouchableOpacity>
        )}
    />
)

export default DashboardNavigation
