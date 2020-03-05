import React from 'react'
import {
    Text,
    View,
    Keyboard,
    TouchableOpacity,
    GestureResponderEvent,
} from 'react-native'

import LoadingBalls from 'src/ui/components/loading-balls'
import styles from './touchable-segment.styles'

export interface Props {
    text: string
    skipBottomBorder?: boolean
    onPress: (e: GestureResponderEvent) => void
    disabled?: boolean
    loading?: boolean
}

const TouchableSegment: React.StatelessComponent<Props> = props => (
    <TouchableOpacity
        disabled={props.disabled}
        style={styles.outter}
        onPress={(e: GestureResponderEvent) => {
            Keyboard.dismiss()
            props.onPress(e)
        }}
    >
        <View
            style={[
                styles.container,
                props.skipBottomBorder ? null : styles.border,
            ]}
        >
            <Text style={styles.mainText}>{props.text}</Text>
            {props.loading ? null : props.children}
        </View>
    </TouchableOpacity>
)

export default TouchableSegment
