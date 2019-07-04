import React from 'react'
import {
    View,
    TouchableOpacity,
    Text,
    GestureResponderEvent,
} from 'react-native'

import styles from './meta-picker-entry.styles'

export interface Props {
    text: string
    isChecked?: boolean
    skipBottomBorder?: boolean
    onPress: (e: GestureResponderEvent) => void
}

const MetaPickerEntry: React.StatelessComponent<Props> = props => (
    <TouchableOpacity onPress={props.onPress}>
        <View
            style={[
                styles.container,
                props.skipBottomBorder ? null : styles.containerBorder,
            ]}
        >
            <View style={styles.entry}>
                <Text style={styles.entryText}>{props.text}</Text>
            </View>
            <View
                style={[
                    styles.checkmark,
                    props.isChecked ? null : styles.checkmarkHidden,
                ]}
            />
        </View>
    </TouchableOpacity>
)

export default MetaPickerEntry
