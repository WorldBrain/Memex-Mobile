import React from 'react'
import { Text, GestureResponderEvent, TouchableOpacity } from 'react-native'

import styles from './side-menu.styles'

export interface Props {
    onPress: (e: GestureResponderEvent) => void
}

const SideMenuItem: React.StatelessComponent<Props> = props => (
    <TouchableOpacity style={styles.item} onPress={props.onPress}>
        <Text style={styles.itemText}>{props.children}</Text>
    </TouchableOpacity>
)

export default SideMenuItem
