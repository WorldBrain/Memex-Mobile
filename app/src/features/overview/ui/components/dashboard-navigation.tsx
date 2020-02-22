import React from 'react'
import { Image, TouchableOpacity } from 'react-native'

import Navigation, { Props as NavProps } from './navigation'
import navigationStyles from 'src/features/overview/ui/components/navigation.styles'

const ExitIcon = require('../img/closeIcon.png')
const SettingsIcon = require('../img/menuIcon.png')
const MemexIcon = require('../img/MemexIcon.png')

export interface Props extends NavProps {
    icon: 'exit' | 'settings'
    onRightIconPress: () => void
    titleText: string
}

const DashboardNavigation: React.StatelessComponent<Props> = props => (
    <Navigation
        {...props}
        renderLeftIcon={() => (
            <TouchableOpacity style={navigationStyles.btnContainer}>
                <Image
                    resizeMode="contain"
                    source={MemexIcon}
                    style={navigationStyles.logoIcon}
                />
            </TouchableOpacity>
        )}
        renderRightIcon={() => (
            <TouchableOpacity
                onPress={props.onRightIconPress}
                style={navigationStyles.btnContainer}
            >
                <Image
                    resizeMode="contain"
                    source={props.icon === 'exit' ? ExitIcon : SettingsIcon}
                    style={navigationStyles.settingsIcon}
                />
            </TouchableOpacity>
        )}
    />
)

export default DashboardNavigation
