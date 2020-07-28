import React from 'react'
import { View, TouchableWithoutFeedback, Text } from 'react-native'

import Container from './result-container'
import Body, { Props as BodyProps } from './result-page-body'
import Footer, { Props as FooterProps } from './result-footer'
import Tags from './result-page-tags'
import {
    DeleteActionBarBtn,
    TagBtnFull,
    TagBtn,
    CommentBtn,
    FullCommentBtn,
    StarBtn,
    FullListActionBarWhiteBtn,
    AddListActionBarWhiteBtn,
    StarBtnFull,
    ReaderActionBarBtn,
} from './action-btns'
import ActionBar from './result-page-action-bar'
import { TouchEventHandler, UIPage } from 'src/ui/types'
import styles from './result-page-view-button.styles'

export interface Props extends FooterProps, BodyProps, UIPage {}

export interface InteractionProps {
    onTagPress: TouchEventHandler
    onStarPress: TouchEventHandler
    onListsPress: TouchEventHandler
    onVisitPress: TouchEventHandler
    onDeletePress: TouchEventHandler
    onResultPress?: TouchEventHandler
    onReaderPress?: TouchEventHandler
    onCommentPress: TouchEventHandler
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
                            <StarBtnFull onPress={props.onStarPress} />
                        ) : (
                            <StarBtn onPress={props.onStarPress} />
                        )}
                        {props.notes.length > 0 ? (
                            <FullCommentBtn onPress={props.onCommentPress} />
                        ) : (
                            <CommentBtn onPress={props.onCommentPress} />
                        )}
                        {props.tags.length > 0 ? (
                            <TagBtnFull onPress={props.onTagPress} />
                        ) : (
                            <TagBtn onPress={props.onTagPress} />
                        )}
                    </Footer>
                </View>
            </View>
        </Container>
        {props.isResultPressed && (
            <ActionBar
                renderLeftSection={style => (
                    <Text onPress={props.onVisitPress} style={style}>
                        Visit
                    </Text>
                )}
            >
                {props.onReaderPress && (
                    <ReaderActionBarBtn onPress={props.onReaderPress} />
                )}
                {props.lists.length > 0 ? (
                    <FullListActionBarWhiteBtn onPress={props.onListsPress} />
                ) : (
                    <AddListActionBarWhiteBtn onPress={props.onListsPress} />
                )}
                <DeleteActionBarBtn onPress={props.onDeletePress} />
            </ActionBar>
        )}
    </View>
)

export default ResultPage
