import React from 'react';
import { View, Image, Text } from "react-native";

import styles from './result-note-body.styles'

export interface Props {
    noteText?: string
    commentText?: string
}

const ResultNoteBody: React.StatelessComponent<Props> = props => (
    <>
        {props.noteText && <Text style={styles.noteText}>{props.noteText}</Text>}
        {props.commentText && <Text style={styles.commentText}>{props.commentText}</Text>}
    </>
)

export default ResultNoteBody
