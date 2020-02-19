import React from 'react'
import { View, TextInput } from 'react-native'

import styles from './note-input-segment.styles'

export interface Props {
    containerClassName?: string
    className?: string
    value: string
    disabled?: boolean
    onChange: (text: string) => void
}

const NoteInput: React.StatelessComponent<Props> = props => (
    <View style={[styles.container, props.containerClassName]}>
        <TextInput
            style={[styles.textInput, props.className]}
            value={props.value}
            onChangeText={props.onChange}
            textAlignVertical="top"
            placeholder="Add Note"
            editable={!props.disabled}
            placeholderTextColor={'#3a2f45'}
            multiline
            autoFocus
        />
    </View>
)

export default NoteInput
