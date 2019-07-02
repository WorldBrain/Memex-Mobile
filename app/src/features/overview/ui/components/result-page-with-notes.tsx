import React from 'react';
import { FlatList, View, ListRenderItem } from 'react-native';

import styles from './result-page-with-notes.styles'
import ResultPage, {
    Props as PageProps,
    InteractionProps as PageInteractionProps,
} from './result-page'
import ResultNote, { Props as NoteProps } from './result-note'
import Dropdown from './notes-dropdown'
import { NativeTouchEventHandler } from '../../types'

export interface Props extends PageProps, PageInteractionProps {
    notes: NoteProps[]
    isOpen?: boolean
    initNoteDelete: (note: NoteProps) => NativeTouchEventHandler
    initNoteEdit: (note: NoteProps) => NativeTouchEventHandler
    initNoteStar: (note: NoteProps) => NativeTouchEventHandler
}

class ResultPageWithNotes extends React.PureComponent<Props> {
    private renderNote: ListRenderItem<NoteProps> = ({ item, index }) => (
        <ResultNote
            onDeletePress={this.props.initNoteDelete(item)}
            onStarPress={this.props.initNoteStar(item)}
            onEditPress={this.props.initNoteEdit(item)}
            key={index}
            {...item}
        />
    )

    render() {
        const { notes, isOpen, ...pageProps } = this.props

        return (
            <>
                <ResultPage {...pageProps} />
                <View style={styles.notesDropdown}>
                    <Dropdown isOpen={isOpen} resultsCount={notes.length} />
                    {isOpen &&
                    <FlatList
                        renderItem={this.renderNote}
                        data={this.props.notes}
                        keyExtractor={(item, index) => index.toString()}
                    />}
                </View>
            </>
        )
    }
}

export default ResultPageWithNotes
