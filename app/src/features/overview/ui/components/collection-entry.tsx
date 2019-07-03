import React from 'react'
import { Text, TouchableOpacity, GestureResponderEvent } from 'react-native'

import styles from './collection-etnry.styles'

export interface Props {
    name: string
    isSelected: boolean
    onSelect: (e: GestureResponderEvent) => void
}

const CollectionEntry: React.StatelessComponent<Props> = props => (
    <TouchableOpacity onPress={props.onSelect}>
        <Text
            style={[styles.mainText, props.isSelected ? styles.active : null]}
        >
            {props.name}
        </Text>
    </TouchableOpacity>
)

export default CollectionEntry
