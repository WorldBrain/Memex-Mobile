import React from 'react'
import {
    View,
    Text,
    NativeSyntheticEvent,
    NativeTouchEvent,
} from 'react-native'

import Button from 'src/ui/components/memex-btn'
import EmptyLayout from './empty'
import styles from './sync.styles'

export interface Props {
    btnText: string
    cancelBtnText?: string
    titleText: string
    subtitleText?: string
    showScreenProgress?: boolean
    disableMainBtn?: boolean
    children: React.ReactNode
    onBtnPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
    onCancelBtnPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const SyncLayout: React.StatelessComponent<Props> = ({
    cancelBtnText = 'Cancel',
    ...props
}) => (
    <EmptyLayout>
        <Text style={styles.titleText}>{props.titleText}</Text>
        {props.subtitleText && (
            <Text style={styles.subtitleText}>{props.subtitleText}</Text>
        )}
        <View style={styles.children}>{props.children}</View>
        <View style={styles.buttonContainer}>
            <Button
                title={props.btnText}
                onPress={props.onBtnPress!}
                disabled={props.disableMainBtn}
                // __notReallyDisabled
            />
            {props.onCancelBtnPress && (
                <Button
                    title={cancelBtnText}
                    onPress={props.onCancelBtnPress}
                    style={styles.cancelButton}
                    empty
                />
            )}
        </View>
    </EmptyLayout>
)

export default SyncLayout
