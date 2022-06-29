import React from 'react'
import { View, Text } from 'react-native'

import styles from './picker-entry.styles'

export interface Props {
    hasSearchInput: boolean
}

const MetaPickerEmptyRow: React.StatelessComponent<Props> = (props) => (
    <View style={styles.container}>
        <Text style={styles.emptyRowText}>
            {props.hasSearchInput
                ? `No matching Space found...`
                : `No Spaces exist yet...`}
        </Text>
    </View>
)

export default MetaPickerEmptyRow
