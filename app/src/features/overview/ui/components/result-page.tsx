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
import { View, TouchableWithoutFeedback, Text } from 'react-native'
import styles from './result-page-view-button.styles'

export interface Props extends FooterProps, BodyProps {
    buttonLabel?: string
    isStarred?: boolean
    isResultPressed?: boolean
}

export interface InteractionProps {
    onResultPress?: NativeTouchEventHandler
    onDeletePress: NativeTouchEventHandler
    onTagPress: NativeTouchEventHandler
    onCommentPress: NativeTouchEventHandler
    onStarPress: NativeTouchEventHandler
}

const ResultPage: React.StatelessComponent<Props &
    InteractionProps> = props => (
    <View>
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
        {props.isResultPressed && (
            <TouchableWithoutFeedback>
                <View style={styles.container}>
                    <Text style={styles.text}>{props.buttonLabel}</Text>
                </View>
            </TouchableWithoutFeedback>
        )}
    </View>
)

export default ResultPage
