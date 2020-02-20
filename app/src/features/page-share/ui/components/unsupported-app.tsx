import React from 'react'
import { View, Text } from 'react-native'

import styles from './unsupported-app.styles'

export interface Props {}

const UnsupportedApp: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.text}>
            This application is currently unsupported by Memex Go.
        </Text>
        <Text style={styles.text}>
            Please see LINK_TO_ISSUE for further discussion and plans.
        </Text>
    </View>
)

export default UnsupportedApp
