import React from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    GestureResponderEvent,
} from 'react-native'

import styles from './meta-picker-entry.styles'

export interface Props {
    text: string
    canAdd?: boolean
    isChecked?: boolean
    skipBottomBorder?: boolean
    showTextBackground?: boolean
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
            {props.canAdd && <Text style={styles.addText}>Add new:</Text>}
            <View
                style={[
                    styles.entry,
                    props.showTextBackground ? styles.entryBackground : null,
                ]}
            >
                <Text style={styles.entryText}>{props.text}</Text>
            </View>
            <Image
                style={[
                    styles.checkmark,
                    props.isChecked ? null : styles.checkmarkHidden,
                ]}
                source={require('src/ui/img/tick.png')}
            />
        </View>
    </TouchableOpacity>
)

export default MetaPickerEntry
