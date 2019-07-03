import React from 'react'
import { View, Text } from 'react-native'

import LoadingBalls from 'src/ui/components/loading-balls'
import styles from './sync-loading-stage.styles'

export interface Props {}

const SyncLoadingStage: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <View style={styles.icon} />
        <LoadingBalls />
        <Text style={styles.text}>Syncing information from your computer</Text>
    </View>
)

export default SyncLoadingStage
