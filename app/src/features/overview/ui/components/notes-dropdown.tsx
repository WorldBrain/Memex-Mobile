import React from 'react'
import { Text, TouchableOpacity, GestureResponderEvent } from 'react-native'

import styles from './notes-dropdown.styles'

export interface Props {
    isOpen: boolean
    resultsCount: number
    onPress: (e: GestureResponderEvent) => void
}

const NotesDropdown: React.StatelessComponent<Props> = props => (
    <TouchableOpacity style={styles.dropdown} onPress={props.onPress}>
        <Text style={styles.resultsCount}>{props.resultsCount} results</Text>
        <Text style={styles.toggleIcon}>
            {props.isOpen ? 'OPEN' : 'CLOSED'}
        </Text>
    </TouchableOpacity>
)

export default NotesDropdown
