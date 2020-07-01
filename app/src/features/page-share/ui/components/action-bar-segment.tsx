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
    showReaderBanner?: boolean
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
    <>
        {props.showReaderBanner && (
            <View style={[styles.readerSegmentContainer, styles.readerSegment]}>
                <Text style={styles.readerSegmentText}>
                    New: Annotate page within app!
                </Text>
            </View>
        )}
        <View style={styles.container} onTouchStart={() => Keyboard.dismiss()}>
            <View style={styles.buttonContainerLeft}>
                {props.onLeftBtnPress ? (
                    <TouchableOpacity onPress={props.onLeftBtnPress}>
                        <Text style={styles.buttonText}>{leftBtnText}</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.placeholderBtn}>Back</Text>
                )}
            </View>
            <View style={styles.mainContent}>{props.children}</View>
            <View style={styles.buttonContainerRight}>
                {props.onRightBtnPress ? (
                    props.isConfirming ? (
                        <TouchableOpacity disabled>
                            <Text style={styles.buttonTextDisabled}>
                                Saving...
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={props.onRightBtnPress}>
                            <Text style={styles.buttonText}>
                                {rightBtnText}
                            </Text>
                        </TouchableOpacity>
                    )
                ) : null}
            </View>
        </View>
    </>
)

export default ActionBar
