import React from 'react'
import { TextInput, View } from 'react-native'

import { MetaTypeName } from '../../types'
import styles from './search-add-input.styles'

export interface Props {
    value: string
    type: MetaTypeName
    onChange: (text: string) => void
}

const SearchAddInput: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <TextInput
            style={styles.textInput}
            value={props.value}
            onChangeText={props.onChange}
            placeholder={`Search & Add ${props.type}`}
            placeholderTextColor="#36362f"
            autoCapitalize="none"
        />
    </View>
)

export default SearchAddInput
