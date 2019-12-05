import React from 'react'
import { View, Text } from 'react-native'

import LoadingBalls from 'src/ui/components/loading-balls'
import Button from 'src/ui/components/memex-btn'
import styles from './sync-loading-stage.styles'

export interface Props {
    __backToOverview: () => void
}

const SyncLoadingStage: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <View style={styles.icon} />
        <LoadingBalls />
        <Text style={styles.text}>Pairing devices and syncing data</Text>
        <Button onPress={props.__backToOverview} title="CANCEL" />
    </View>
)

export default SyncLoadingStage
