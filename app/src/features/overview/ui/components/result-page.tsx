import React from 'react'

import Container from './result-container'
import Body, { Props as BodyProps } from './result-page-body'
import Comments, { Props as CommentProps } from './result-note-body'
import Footer, { Props as FooterProps } from './result-footer'
import Tags, { Props as TagsProps } from './result-page-tags'
import {
    DeleteBtn,
    FullTagBtn,
    TagBtn,
    CommentBtn,
    FullCommentBtn,
    StarBtn,
    FullStarBtn,
} from './action-btns'
import { NativeTouchEventHandler } from '../../types'
import { View, TouchableWithoutFeedback, Text } from 'react-native'
import styles from './result-page-view-button.styles'
import { UINote } from 'src/features/overview/types'

export interface Props extends FooterProps, BodyProps {
    notes: UINote[]
    tags: string[]
    buttonLabel?: string
    isStarred?: boolean
    isResultPressed?: boolean
    domain: string
    fullUrl: string
}

export interface InteractionProps {
    onResultPress?: NativeTouchEventHandler
    onDeletePress: NativeTouchEventHandler
    onTagPress: NativeTouchEventHandler
    onCommentPress: NativeTouchEventHandler
    onStarPress: NativeTouchEventHandler
    onVisitPress: NativeTouchEventHandler
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
                        <Text style={styles.date}>{props.date}</Text>
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
        {props.isResultPressed && (
            <TouchableWithoutFeedback>
                <View style={styles.container}>
                    <Text onPress={props.onVisitPress} style={styles.text}>
                        {props.buttonLabel}
                    </Text>
                    <DeleteBtn onPress={props.onDeletePress} />
                </View>
            </TouchableWithoutFeedback>
        )}
    </View>
)

export default ResultPage
