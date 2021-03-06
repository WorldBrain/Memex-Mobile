import React from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    GestureResponderEvent,
} from 'react-native'

import styles from './picker-entry.styles'

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
            <View style={styles.textContainer}>
                {props.canAdd && <Text style={styles.addText}>Add new:</Text>}
                <View
                    style={[
                        styles.entry,
                        props.showTextBackground
                            ? styles.entryBackground
                            : null,
                        props.canAdd && styles.canAdd,
                    ]}
                >
                    <Text style={styles.entryText}>{props.text}</Text>
                </View>
            </View>
            <View style={styles.checkMarkContainer}>
                <Image
                    resizeMode="contain"
                    style={[
                        styles.checkmark,
                        props.isChecked ? null : styles.checkmarkHidden,
                    ]}
                    source={require('src/ui/img/tick.png')}
                />
            </View>
        </View>
    </TouchableOpacity>
)

export default MetaPickerEntry
