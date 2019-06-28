import React from 'react';

import Container from './result-container'
import Body, { Props as BodyProps } from './result-note-body'
import Footer, { Props as FooterProps } from './result-footer'
import { DeleteBtn, EditBtn, StarBtn } from './action-btns'
import { NativeTouchEventHandler } from '../../types'

export interface Props extends FooterProps, BodyProps {}

export interface InteractionProps {
    onDeletePress: NativeTouchEventHandler
    onEditPress: NativeTouchEventHandler
    onStarPress: NativeTouchEventHandler
}

const ResultNote: React.StatelessComponent<Props & InteractionProps> = props => (
    <Container renderFooter={() => (
        <Footer {...props}>
            <DeleteBtn onPress={props.onDeletePress} />
            <EditBtn onPress={props.onEditPress} />
            <StarBtn onPress={props.onStarPress} />
        </Footer>
    )}>
        <Body {...props} />
    </Container>
)

export default ResultNote
