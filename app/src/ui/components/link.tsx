import React from 'react'
import { Linking, Text, StyleProp } from 'react-native'

import styles from './link.styles'

export interface Props {
    href: string
    style?: StyleProp<any>
    onPress?: () => Promise<void>
}

const Link: React.StatelessComponent<Props> = ({
    href,
    children,
    style,
    onPress = () => Linking.openURL(href),
}) => (
    <Text style={[styles.linkText, style]} onPress={onPress}>
        {children}
    </Text>
)

export default Link
