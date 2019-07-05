import React from 'react'
import { View, GestureResponderEvent } from 'react-native'

import styles from './result-page-with-notes.styles'
import ResultPage, {
    Props as PageProps,
    InteractionProps as PageInteractionProps,
} from './result-page'
import Dropdown from './notes-dropdown'
import NoteList, { Props as NoteListProps } from './notes-list'

export interface Props extends PageProps, PageInteractionProps, NoteListProps {
    isOpen?: boolean
    onDropdownPress: (e: GestureResponderEvent) => void
}

const ResultPageWithNotes: React.StatelessComponent<Props> = props => (
    <>
        <ResultPage {...props} />
        <View style={styles.notesDropdown}>
            <Dropdown
                isOpen={props.isOpen}
                resultsCount={props.notes.length}
                onPress={props.onDropdownPress}
            />
            {props.isOpen && <NoteList {...props} />}
        </View>
    </>
)

export default ResultPageWithNotes
