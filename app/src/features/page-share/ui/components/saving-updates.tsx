import React from 'react'
import { View, Text } from 'react-native'

import styles from './saving-updates.styles'
import LoadingBalls from 'src/ui/components/loading-balls'

export interface Props {}

const SavingUpdates: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <LoadingBalls />
        <Text style={styles.mainText}>Saving updates</Text>
    </View>
)

export default SavingUpdates
