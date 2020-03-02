import React from 'react'
import {
    View,
    Text,
    NativeSyntheticEvent,
    NativeTouchEvent,
    Keyboard,
    TouchableOpacity,
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
            <TouchableOpacity onPress={props.onCancelPress}>
                <Text style={styles.buttonText}>Back</Text>
            </TouchableOpacity>
        ) : (
            <Text style={styles.placeholderBtn}>Back</Text>
        )}
        <Text style={styles.mainText}>{props.children}</Text>
        {props.onConfirmPress ? (
            props.isConfirming ? (
                <TouchableOpacity disabled>
                    <Text style={styles.buttonTextDisabled}>Saving...</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={props.onConfirmPress}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            )
        ) : (
            <View />
        )}
    </View>
)

export default ActionBar
