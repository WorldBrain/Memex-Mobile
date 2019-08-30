import React from 'react'
import {
    View,
    Text,
    Button,
    NativeSyntheticEvent,
    NativeTouchEvent,
    Keyboard,
} from 'react-native'

import styles from './action-bar-segment.styles'

export interface Props {
    isConfirming?: boolean
    onCancelPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
    onConfirmPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const ActionBar: React.StatelessComponent<Props> = props => (
    <View style={styles.container} onTouchStart={() => Keyboard.dismiss()}>
        {props.onCancelPress ? (
            <Button title="Back" onPress={props.onCancelPress} />
        ) : (
            <Text style={styles.placeholderBtn}>Back</Text>
        )}
        <Text style={styles.mainText}>{props.children}</Text>
        {props.onConfirmPress &&
            (props.isConfirming ? (
                <Button title="Saving..." disabled onPress={f => f} />
            ) : (
                <Button title="Save" onPress={props.onConfirmPress} />
            ))}
    </View>
)

export default ActionBar
