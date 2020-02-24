import React from 'react'
import { TextInput, View } from 'react-native'

import styles from './suggest-input.styles'

export interface Props {
    value: string
    placeholder: string
    onChange: (text: string) => void
}

const SuggestInput: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <TextInput
            style={styles.textInput}
            value={props.value}
            onChangeText={props.onChange}
            placeholder={props.placeholder}
            placeholderTextColor="#36362f"
            autoCapitalize="none"
        />
    </View>
)

export default SuggestInput
