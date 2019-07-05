import React from 'react'
import {
    View,
    Text,
    Image,
    GestureResponderEvent,
    TouchableOpacity,
} from 'react-native'

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
            <Image
                style={styles.countIcon}
                source={require('src/features/overview/ui/img/comment-full.png')}
            />
            <Text style={styles.mainText}>Existing Notes</Text>
            <TouchableOpacity onPress={props.onAddNotePress}>
                <Image
                    style={styles.addIcon}
                    source={require('src/ui/img/plus.png')}
                />
            </TouchableOpacity>
        </View>
        <View style={styles.noteListContainer}>
            <NoteList clearBackground {...props} />
        </View>
    </View>
)

export default ExistingNotes
