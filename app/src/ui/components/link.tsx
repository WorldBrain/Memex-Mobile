import React from 'react'
import { Linking, Text, StyleProp } from 'react-native'

import styles from './link.styles'

export interface Props {
    href: string
    style?: StyleProp<any>
}

const Link: React.StatelessComponent<Props> = ({ href, children, style }) => (
    <Text
        style={[styles.linkText, style]}
        onPress={() => Linking.openURL(href)}
    >
        {children}
    </Text>
)

export default Link
