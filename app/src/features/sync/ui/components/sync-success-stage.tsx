import React from 'react'
import { View, Text, TouchableOpacity, Button as StdButton } from 'react-native'

import Button from 'src/ui/components/memex-btn'
import E2EEMessage from './e2ee-msg'
import styles from './sync-success-stage.styles'

export interface Props {
    onBtnPress: (e: any) => void
    onBackBtnPress?: (e: any) => void
    allowRePairing?: boolean
}

const SyncSuccessStage: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        {props.onBackBtnPress && (
            <TouchableOpacity style={styles.backBtn}>
                <StdButton title="Back" onPress={props.onBackBtnPress} />
            </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
            <View style={styles.icon} />
            <Text style={styles.text}>
                Pairing successful. You're ready to go!
            </Text>
            <E2EEMessage />
        </View>
        {props.allowRePairing ? (
            <Button
                title="Pair with new device"
                onPress={props.onBtnPress}
                warning
            />
        ) : (
            <Button title="Get Started" onPress={props.onBtnPress} />
        )}
    </View>
)

export default SyncSuccessStage
