import React from 'react'
import {
    Text,
    View,
    TouchableOpacity,
    ButtonProps,
    StyleProp,
} from 'react-native'

import styles from './memex-btn.styles'

export interface Props extends ButtonProps {
    style?: StyleProp<any>
    smallWidth?: boolean
    secondary?: boolean
    warning?: boolean
    hidden?: boolean
    empty?: boolean
}

const MainLayout: React.StatelessComponent<Props> = props =>
    props.hidden ? (
        <View style={[styles.button, styles.buttonHidden]} />
    ) : (
        <TouchableOpacity
            onPress={props.onPress}
            style={[
                styles.button,
                props.smallWidth ? styles.buttonSmallWidth : null,
                props.secondary ? styles.buttonSecondary : null,
                props.warning ? styles.buttonWarn : null,
                props.empty ? styles.buttonEmpty : null,
                props.style,
            ]}
        >
            <Text style={[styles.text, props.warning ? styles.textWarn : null]}>
                {props.title}
            </Text>
        </TouchableOpacity>
    )

export default MainLayout
