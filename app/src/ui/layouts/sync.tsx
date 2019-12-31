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
    isComingSoon?: boolean
    disableMainBtn?: boolean
    onBtnPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
    onCancelBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
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
        <View style={styles.comingSoonContainer}>
            {props.isComingSoon && (
                <Text style={styles.comingSoonText}>Coming soon</Text>
            )}
        </View>
        <View style={styles.children}>{props.children}</View>
        <Button
            title={props.btnText}
            onPress={props.onBtnPress}
            disabled={props.disableMainBtn}
            __notReallyDisabled
        />
        <Button title={cancelBtnText} onPress={props.onCancelBtnPress} empty />
    </EmptyLayout>
)

export default SyncLayout
