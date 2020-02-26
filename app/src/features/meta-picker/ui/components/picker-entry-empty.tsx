import React from 'react'
import { View, Text } from 'react-native'

import styles from './picker-entry.styles'
import { MetaType } from '../../types'

export interface Props {
    type: MetaType
}

const MetaPickerEmptyRow: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.emptyRowText}>No {props.type} exist yet...</Text>
    </View>
)

export default MetaPickerEmptyRow
