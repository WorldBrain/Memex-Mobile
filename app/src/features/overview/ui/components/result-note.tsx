import React from 'react'
import { View, TouchableWithoutFeedback } from 'react-native'

import Container from './result-container'
import Body, { Props as BodyProps } from './result-note-body'
import { DeleteActionBarBtn, EditNoteActionBarBtn } from './action-btns'
import ActionBar from './result-page-action-bar'
import Tags from './result-page-tags'
import { TouchEventHandler } from 'src/ui/types'
import styles from './result-note.styles'

export interface Props extends BodyProps {
    isStarred?: boolean
    tags: string[]
}

export interface InteractionProps {
    clearBackground?: boolean
    isNotePressed: boolean
    onDeletePress: TouchEventHandler
    onEditPress: TouchEventHandler
    onNotePress: TouchEventHandler
    hideFooter?: boolean
}

const ResultNote: React.StatelessComponent<Props &
    InteractionProps> = props => (
    <>
        <Container isNote={!props.clearBackground}>
            <TouchableWithoutFeedback onPress={props.onNotePress}>
                <View style={styles.contentContainer}>
                    <Body {...props} />
                    <Tags tags={props.tags} style={styles.tagsContainer} />
                </View>
            </TouchableWithoutFeedback>
        </Container>
        {props.isNotePressed && (
            <ActionBar>
                <EditNoteActionBarBtn onPress={props.onEditPress} />
                <DeleteActionBarBtn onPress={props.onDeletePress} />
            </ActionBar>
        )}
    </>
)

export default ResultNote
