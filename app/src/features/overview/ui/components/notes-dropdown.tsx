import React from 'react';
import { View, Text } from 'react-native'

import styles from './notes-dropdown.styles'

export interface Props {
    isOpen: boolean
    resultsCount: number
}

const NotesDropdown: React.StatelessComponent<Props> = props => (
    <View style={styles.dropdown}>
        <Text style={styles.resultsCount}>{props.resultsCount} annotation results</Text>
        <Text style={styles.toggleIcon}>{props.isOpen ? 'OPEN' : 'CLOSED' }</Text>
    </View>
)

export default NotesDropdown
