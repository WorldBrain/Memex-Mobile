import React from 'react'
import {
    View,
    Text,
    GestureResponderEvent,
    TextInput,
    Button,
} from 'react-native'
import { TextEditor } from 'src/ui/utils/editor'

import styles from './note-adder.styles'

export interface Props {
    value: string
    onChange: (text: string) => void
    onSavePress: (e: GestureResponderEvent) => void
    onCancelPress: (e: GestureResponderEvent) => void
}

const NoteAdder: React.StatelessComponent<Props> = (props) => (
    <View style={styles.container}>
        <Text style={styles.mainText}>Add New Note</Text>
        <View style={styles.inputContainer}>
            <TextEditor />
            <TextInput
                style={styles.textInput}
                value={props.value}
                onChangeText={props.onChange}
                textAlignVertical="top"
                placeholder="Note text"
                multiline
            />
        </View>
        <View style={styles.btnContainer}>
            <Button title="Save" onPress={props.onSavePress} />
            <Button title="Cancel" onPress={props.onCancelPress} color="red" />
        </View>
    </View>
)

export default NoteAdder
