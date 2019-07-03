import React from 'react'
import { View, TextInput } from 'react-native'

import styles from './note-input-segment.styles'

export interface Props {
    value: string
    onChange: (text: string) => void
}

const NoteInput: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <TextInput
            style={styles.textInput}
            value={props.value}
            onChangeText={props.onChange}
            textAlignVertical="top"
            placeholder="Add Note"
            multiline
        />
    </View>
)

export default NoteInput
