import React from 'react'
import { Text } from 'react-native'

import styles from './settings-link.styles'
import { TouchableOpacity } from 'react-native-gesture-handler'

export interface Props {
    onPress: () => void
    skipBottomBorder?: boolean
}

const SettingsLink: React.StatelessComponent<Props> = props => (
    <TouchableOpacity
        onPress={props.onPress}
        style={[props.skipBottomBorder ? null : styles.container]}
    >
        <Text style={styles.link}>{props.children}</Text>
    </TouchableOpacity>
)

export default SettingsLink
