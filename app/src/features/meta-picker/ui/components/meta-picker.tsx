import React from 'react'
import { View, TextInput, Text } from 'react-native'

import styles from './meta-picker.styles'

export interface Props {}

const MetaPicker: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>{props.children}</View>
)

export default MetaPicker
