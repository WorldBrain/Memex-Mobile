import React from 'react'
import { View, Text } from 'react-native'

import styles from './unsupported-app.styles'

export interface Props {}

const UnsupportedApp: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.mainText}>
            This application is currently unsupported
        </Text>
        <Text style={styles.text}>Fixing this is high up on our roadmap</Text>
    </View>
)

export default UnsupportedApp
