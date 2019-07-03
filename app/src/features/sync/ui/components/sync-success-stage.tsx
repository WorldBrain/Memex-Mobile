import React from 'react'
import { View, Text } from 'react-native'

import Button from 'src/ui/components/memex-btn'
import styles from './sync-success-stage.styles'

export interface Props {
    onBtnPress: (e: any) => void
}

const SyncSuccessStage: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <View style={styles.textContainer}>
            <View style={styles.icon} />
            <Text style={styles.text}>
                Paring successful. You're ready to go!
            </Text>
        </View>
        <Button title="Get Started" onPress={props.onBtnPress} />
    </View>
)

export default SyncSuccessStage
