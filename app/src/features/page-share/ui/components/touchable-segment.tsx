import React from 'react'
import {
    Text,
    View,
    TouchableOpacity,
    GestureResponderEvent,
} from 'react-native'

import styles from './touchable-segment.styles'

export interface Props {
    text: string
    skipBottomBorder?: boolean
    onPress: (e: GestureResponderEvent) => void
}

const TouchableSegment: React.StatelessComponent<Props> = props => (
    <TouchableOpacity style={styles.outter} onPress={props.onPress}>
        <View
            style={[
                styles.container,
                props.skipBottomBorder ? null : styles.border,
            ]}
        >
            <Text style={styles.mainText}>{props.text}</Text>
            {props.children}
        </View>
    </TouchableOpacity>
)

export default TouchableSegment
