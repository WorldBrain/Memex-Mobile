import React from 'react'
import { TouchableWithoutFeedback } from 'react-native'

import Container from './result-container'
import Body, { Props as BodyProps } from './result-note-body'
import { DeleteBtn, EditNoteBtn } from './action-btns'
import ActionBar from './result-page-action-bar'
import { NativeTouchEventHandler } from '../../types'

export interface Props extends BodyProps {
    isStarred?: boolean
}

export interface InteractionProps {
    clearBackground?: boolean
    isNotePressed: boolean
    onDeletePress: NativeTouchEventHandler
    onEditPress: NativeTouchEventHandler
    onNotePress: NativeTouchEventHandler
    hideFooter?: boolean
}

const ResultNote: React.StatelessComponent<Props &
    InteractionProps> = props => (
    <>
        <Container isNote={!props.clearBackground}>
            <TouchableWithoutFeedback onPress={props.onNotePress}>
                <Body {...props} />
            </TouchableWithoutFeedback>
        </Container>
        {props.isNotePressed && (
            <ActionBar>
                <EditNoteBtn onPress={props.onEditPress} />
                <DeleteBtn onPress={props.onDeletePress} />
            </ActionBar>
        )}
    </>
)

export default ResultNote
