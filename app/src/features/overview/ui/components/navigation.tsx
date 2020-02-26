import React from 'react'
import { View, Text } from 'react-native'

import styles from './navigation.styles'

export interface Props {
    titleText?: string
    renderLeftIcon?: () => JSX.Element
    renderRightIcon?: () => JSX.Element
}

const Navigation: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <View style={styles.leftBtnContainer}>
            {props.renderLeftIcon && props.renderLeftIcon()}
        </View>
        <View style={styles.textContainer}>
            {props.titleText && (
                <Text numberOfLines={1} style={styles.text}>
                    {props.titleText}
                </Text>
            )}
            {props.children}
        </View>
        <View style={styles.rightBtnContainer}>
            {props.renderRightIcon && props.renderRightIcon()}
        </View>
    </View>
)

export default Navigation
