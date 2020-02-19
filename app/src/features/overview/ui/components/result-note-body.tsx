import React from 'react'
import { Text, View } from 'react-native'

import styles from './result-note-body.styles'

export interface Props {
    noteText?: string
    commentText?: string
    date: string
}

const ResultNoteBody: React.StatelessComponent<Props> = props => (
    <View {...props} style={styles.container}>
        {props.noteText != null && props.noteText.trim().length > 0 && (
            <Text style={styles.noteText}>
                <Text style={styles.text}>{props.noteText}</Text>
            </Text>
        )}
        {props.commentText != null && props.commentText.trim().length > 0 && (
            <Text style={styles.commentText}>{props.commentText}</Text>
        )}
        <Text style={styles.date}>{props.date}</Text>
    </View>
)

export default ResultNoteBody
