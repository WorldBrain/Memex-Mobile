import React from 'react'
import { View } from 'react-native'

import styles from './empty.styles'

export interface Props {}

const EmptyLayout: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>{props.children}</View>
)

export default EmptyLayout
