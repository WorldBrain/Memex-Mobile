import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

import styles from './navigation.styles'

export interface Props {
    renderLeftIcon?: () => JSX.Element
    renderRightIcon?: () => JSX.Element
    onRightIconPress?: () => void
}

const Navigation: React.StatelessComponent<Props> = ({
    onRightIconPress = () => undefined,
    ...props
}) => (
    <View style={styles.container}>
        <View style={styles.logoContainer}>
            {props.renderLeftIcon && props.renderLeftIcon()}
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.text}>{props.children}</Text>
        </View>
        <TouchableOpacity
            style={styles.btnContainer}
            onPress={onRightIconPress}
        >
            {props.renderRightIcon && props.renderRightIcon()}
        </TouchableOpacity>
    </View>
)

export default Navigation
