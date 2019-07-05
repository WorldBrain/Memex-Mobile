import React from 'react'
import { View, Text, GestureResponderEvent } from 'react-native'

import NoteList, {
    Props as NoteListProps,
} from 'src/features/overview/ui/components/notes-list'
import styles from './existing-notes.styles'

export interface Props extends NoteListProps {
    noteAdder: JSX.Element
    onAddNotePress: (e: GestureResponderEvent) => void
}

const ExistingNotes: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        {props.noteAdder}
        <View style={styles.headContainer}>
            <View style={styles.countIcon} />
            <Text style={styles.mainText}>Existing Notes</Text>
            <Text style={styles.addIcon} onPress={props.onAddNotePress}>
                +
            </Text>
        </View>
        <View style={styles.noteListContainer}>
            <NoteList clearBackground {...props} />
        </View>
    </View>
)

export default ExistingNotes
