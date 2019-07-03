import React from 'react'
import { View } from 'react-native'

import styles from './loading-balls.styles'

export interface Props {}

const MainLayout: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <View style={styles.ball} />
        <View style={[styles.ball, styles.ballBig]} />
        <View style={styles.ball} />
    </View>
)

export default MainLayout
