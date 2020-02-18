import React from 'react'
import { View, TouchableWithoutFeedback, Text } from 'react-native'

import Container from './result-container'
import Body, { Props as BodyProps } from './result-page-body'
import Footer, { Props as FooterProps } from './result-footer'
import Tags from './result-page-tags'
import {
    DeleteBtn,
    FullTagBtn,
    TagBtn,
    CommentBtn,
    FullCommentBtn,
    StarBtn,
    FullStarBtn,
} from './action-btns'
import ActionBar, { Props as ActionBarProps } from './result-page-action-bar'
import { NativeTouchEventHandler, UIPage } from '../../types'
import styles from './result-page-view-button.styles'

export interface Props extends FooterProps, BodyProps, UIPage {}

export interface InteractionProps extends ActionBarProps {
    onResultPress?: NativeTouchEventHandler
    onTagPress: NativeTouchEventHandler
    onCommentPress: NativeTouchEventHandler
    onStarPress: NativeTouchEventHandler
}

const ResultPage: React.StatelessComponent<Props &
    InteractionProps> = props => (
    <View>
        <Container>
            <View style={styles.resultContainer}>
                <TouchableWithoutFeedback
                    style={styles.touchContainer}
                    onPress={props.onResultPress}
                >
                    <View style={styles.contentContainer}>
                        <Body {...props} />
                        <Tags tags={props.tags} />
                    </View>
                </TouchableWithoutFeedback>
                <View style={styles.actionContainer}>
                    <Footer {...props}>
                        {props.isStarred ? (
                            <FullStarBtn onPress={props.onStarPress} />
                        ) : (
                            <StarBtn onPress={props.onStarPress} />
                        )}
                        {props.notes.length > 0 ? (
                            <FullCommentBtn onPress={props.onCommentPress} />
                        ) : (
                            <CommentBtn onPress={props.onCommentPress} />
                        )}
                        {props.tags.length > 0 ? (
                            <FullTagBtn onPress={props.onTagPress} />
                        ) : (
                            <TagBtn onPress={props.onTagPress} />
                        )}
                    </Footer>
                </View>
            </View>
        </Container>
        {props.isResultPressed && <ActionBar {...props} />}
    </View>
)

export default ResultPage
