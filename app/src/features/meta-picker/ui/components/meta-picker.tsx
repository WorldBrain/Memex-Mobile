import React from 'react'
import { View } from 'react-native'

import styles from './meta-picker.styles'

export interface Props {
    className?: string
}

const MetaPicker: React.StatelessComponent<Props> = props => (
    <View style={[styles.container, props.className]}>{props.children}</View>
)

export default MetaPicker
