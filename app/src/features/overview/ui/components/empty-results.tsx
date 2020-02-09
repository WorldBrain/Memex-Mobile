import React from 'react'
import { View, Text } from 'react-native'

import styles from './empty-results.styles'

export interface Props {}

const EmptyResults: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.text}>
            Save some pages via your browser's share-to menu to see them show up
            here
        </Text>
    </View>
)

export default EmptyResults
