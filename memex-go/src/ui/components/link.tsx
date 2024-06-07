import React from 'react'
import { Linking, Text, StyleProp } from 'react-native'

import styles from './link.styles'
import styled from 'styled-components/native'

export interface Props {
    href: string
    style?: StyleProp<any>
}

const Link: React.StatelessComponent<Props> = ({ href, children, style }) => (
    <LinkedView onPress={() => Linking.openURL(href)}>{children}</LinkedView>
)

const LinkedView = styled.TouchableOpacity``

export default Link
