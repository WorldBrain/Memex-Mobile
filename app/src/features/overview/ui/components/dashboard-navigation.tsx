import React from 'react'
import { Image } from 'react-native'

import Navigation, { Props as NavProps } from './navigation'
import styles from './dashboard-navigation.styles'
const ExitIcon = require('../img/closeIcon.png')
const SettingsIcon = require('../img/menuIcon.png')
const MemexIcon = require('../img/MemexIcon.png')

export interface Props extends NavProps {
    icon: 'exit' | 'settings'
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
        renderRightIcon={() =>
            props.icon === 'exit' ? (
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
            )
        }
    />
)

export default DashboardNavigation
