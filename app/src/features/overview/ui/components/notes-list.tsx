import React from 'react'
import { FlatList, ListRenderItem } from 'react-native'

import styles from './result-page-with-notes.styles'
import ResultNote from './result-note'
import { NativeTouchEventHandler } from '../../types'
import { Note } from 'src/features/overview/types'

export interface Props {
    notes: Note[]
    initNoteDelete: (note: Note) => NativeTouchEventHandler
    initNoteEdit: (note: Note) => NativeTouchEventHandler
    initNoteStar: (note: Note) => NativeTouchEventHandler
}

class NotesList extends React.PureComponent<Props> {
    private renderNote: ListRenderItem<Note> = ({ item, index }) => (
        <ResultNote
            onDeletePress={this.props.initNoteDelete(item)}
            onStarPress={this.props.initNoteStar(item)}
            onEditPress={this.props.initNoteEdit(item)}
            key={index}
            {...item}
        />
    )

    render() {
        return (
            <FlatList
                renderItem={this.renderNote}
                data={this.props.notes}
                keyExtractor={(item, index) => index.toString()}
                style={styles.list}
            />
        )
    }
}

export default NotesList
