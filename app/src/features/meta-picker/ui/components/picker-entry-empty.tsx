import React from 'react'
import { View, Text } from 'react-native'

import styles from './picker-entry.styles'
import { MetaType } from '../../types'

export interface Props {
    hasSearchInput: boolean
    type: MetaType
}

const MetaPickerEmptyRow: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.emptyRowText}>
            {props.hasSearchInput
                ? `No matching ${props.type} found...`
                : `No ${props.type} exist yet...`}
        </Text>
    </View>
)

export default MetaPickerEmptyRow
