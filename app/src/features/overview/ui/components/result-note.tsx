import React from 'react'

import Container from './result-container'
import Body, { Props as BodyProps } from './result-note-body'
import Footer, { Props as FooterProps } from './result-footer'
import { DeleteBtn, EditBtn, StarBtn, FullStarBtn } from './action-btns'
import { NativeTouchEventHandler } from '../../types'

export interface Props extends FooterProps, BodyProps {
    isStarred?: boolean
}

export interface InteractionProps {
    clearBackground?: boolean
    onDeletePress: NativeTouchEventHandler
    onEditPress: NativeTouchEventHandler
    onStarPress: NativeTouchEventHandler
    hideFooter?: boolean
}

const ResultNote: React.StatelessComponent<Props &
    InteractionProps> = props => (
    <Container
        isNote={!props.clearBackground}
        renderFooter={() => (
            <Footer {...props} hideButtons={props.hideFooter}>
                <DeleteBtn onPress={props.onDeletePress} />
                <EditBtn onPress={props.onEditPress} />
                {props.isStarred ? (
                    <FullStarBtn onPress={props.onStarPress} />
                ) : (
                    <StarBtn onPress={props.onStarPress} />
                )}
            </Footer>
        )}
    >
        <Body {...props} />
    </Container>
)

export default ResultNote
