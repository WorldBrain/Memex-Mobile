import React from 'react'
import { Text, TouchableOpacity, ButtonProps, StyleProp } from 'react-native'

import styles from './memex-btn.styles'

export interface Props extends ButtonProps {
    style?: StyleProp<any>
}

const MainLayout: React.StatelessComponent<Props> = props => (
    <TouchableOpacity
        style={[styles.button, props.style]}
        onPress={props.onPress}
    >
        <Text style={styles.text}>{props.title}</Text>
    </TouchableOpacity>
)

export default MainLayout
