import React from 'react'
import { Text, TouchableOpacity, ButtonProps, StyleProp } from 'react-native'

import styles from './memex-btn.styles'

export interface Props extends ButtonProps {
    style?: StyleProp<any>
    warning?: boolean
    secondary?: boolean
}

const MainLayout: React.StatelessComponent<Props> = props => (
    <TouchableOpacity
        style={[
            styles.button,
            props.warning ? styles.buttonWarn : null,
            props.secondary ? styles.buttonSecondary : null,
            props.style,
        ]}
        onPress={props.onPress}
    >
        <Text style={[styles.text, props.warning ? styles.textWarn : null]}>
            {props.title}
        </Text>
    </TouchableOpacity>
)

export default MainLayout
