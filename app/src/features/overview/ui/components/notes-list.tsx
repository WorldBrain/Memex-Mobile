import React from 'react'
import { FlatList, ListRenderItem } from 'react-native'

import styles from './result-page-with-notes.styles'
import ResultNote from './result-note'
import { NativeTouchEventHandler } from '../../types'
import { UINote } from 'src/features/overview/types'

export interface Props {
    notes: UINote[]
    clearBackground?: boolean
    initNoteDelete: (note: UINote) => NativeTouchEventHandler
    initNoteEdit: (note: UINote) => NativeTouchEventHandler
    initNoteStar: (note: UINote) => NativeTouchEventHandler
}

class NotesList extends React.PureComponent<Props> {
    private renderNote: ListRenderItem<UINote> = ({ item, index }) => (
        <ResultNote
            onDeletePress={this.props.initNoteDelete(item)}
            onStarPress={this.props.initNoteStar(item)}
            onEditPress={this.props.initNoteEdit(item)}
            clearBackground={this.props.clearBackground}
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
