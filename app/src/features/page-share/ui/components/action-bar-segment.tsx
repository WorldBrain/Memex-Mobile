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
    onLeftBtnPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
    onRightBtnPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
    leftBtnText?: string
    rightBtnText?: string
}

const ActionBar: React.StatelessComponent<Props> = ({
    leftBtnText = 'Cancel',
    rightBtnText = 'Confirm',
    ...props
}) => (
    <View style={styles.container} onTouchStart={() => Keyboard.dismiss()}>
        {props.onLeftBtnPress ? (
            <TouchableOpacity onPress={props.onLeftBtnPress}>
                <Text style={styles.buttonText}>{leftBtnText}</Text>
            </TouchableOpacity>
        ) : (
            <Text style={styles.placeholderBtn}>Back</Text>
        )}
        <Text style={styles.mainText}>{props.children}</Text>
        {props.onRightBtnPress ? (
            props.isConfirming ? (
                <TouchableOpacity disabled>
                    <Text style={styles.buttonTextDisabled}>Saving...</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={props.onRightBtnPress}>
                    <Text style={styles.buttonText}>{rightBtnText}</Text>
                </TouchableOpacity>
            )
        ) : (
            <View />
        )}
    </View>
)

export default ActionBar
