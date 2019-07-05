import React from 'react'

import Container from './result-container'
import Body, { Props as BodyProps } from './result-page-body'
import Footer, { Props as FooterProps } from './result-footer'
import {
    DeleteBtn,
    TagBtn,
    CommentBtn,
    StarBtn,
    FullStarBtn,
} from './action-btns'
import { NativeTouchEventHandler } from '../../types'

export interface Props extends FooterProps, BodyProps {
    isStarred?: boolean
}

export interface InteractionProps {
    onDeletePress: NativeTouchEventHandler
    onTagPress: NativeTouchEventHandler
    onCommentPress: NativeTouchEventHandler
    onStarPress: NativeTouchEventHandler
}

const ResultPage: React.StatelessComponent<
    Props & InteractionProps
> = props => (
    <Container
        renderFooter={() => (
            <Footer {...props}>
                <DeleteBtn onPress={props.onDeletePress} />
                <TagBtn onPress={props.onTagPress} />
                <CommentBtn onPress={props.onCommentPress} />
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

export default ResultPage
