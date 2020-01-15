import React from 'react'
import { View, Text, Image } from 'react-native'

import styles from './unsupported-app.styles'

export interface Props {}

const UnsupportedApp: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Image
            style={styles.mainImage}
            source={require('../assets/not-supported.png')}
        />
        <Text style={styles.mainText}>
            This app is currently unsupported by Memex mobile. Please try
            sharing from another browser app.
        </Text>
    </View>
)

export default UnsupportedApp
