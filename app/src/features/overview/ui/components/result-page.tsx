import React from 'react'
import {
    View,
    TouchableWithoutFeedback,
    Text,
    Dimensions,
    Platform,
} from 'react-native'

import Container from './result-container'
import Body, { Props as BodyProps } from './result-page-body'
import Footer, { Props as FooterProps } from './result-footer'
import Tags from './result-page-tags'
import {
    DeleteActionBarBtn,
    TagBtnFull,
    TagBtn,
    TagBtnFullWhite,
    TagBtnWhite,
    CommentBtn,
    FullCommentBtn,
    StarBtn,
    FullListActionBarWhiteBtn,
    AddListActionBarWhiteBtn,
    StarBtnFull,
    ReaderActionBarBtn,
    VisitActionBarBtn,
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
const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

const ResultPage: React.StatelessComponent<Props & InteractionProps> = (
    props,
) => {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                backgroundColor: 'white',
            }}
        >
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
                        {props.notes.length > 0 ? (
                            <FullCommentBtn
                                onPress={props.onCommentPress}
                                commentIcon={1}
                            />
                        ) : (
                            <CommentBtn onPress={props.onCommentPress} />
                        )}
                    </View>
                </View>
            </Container>
            {props.isResultPressed && (
                <ActionBar
                    renderLeftSection={(style) => (
                        <Text onPress={props.onVisitPress} style={style}>
                            Visit
                        </Text>
                    )}
                >
                    {props.onReaderPress && (
                        <ReaderActionBarBtn
                            onPress={props.onReaderPress}
                            ButtonLabel={'Annotate'}
                        />
                    )}
                    {props.tags.length > 0 ? (
                        <TagBtnFullWhite
                            onPress={props.onTagPress}
                            ButtonLabel={'Tags'}
                        />
                    ) : (
                        <TagBtnWhite
                            onPress={props.onTagPress}
                            ButtonLabel={'Tags'}
                        />
                    )}
                    {props.lists.length > 0 ? (
                        <FullListActionBarWhiteBtn
                            onPress={props.onListsPress}
                            ButtonLabel={'Collections'}
                        />
                    ) : (
                        <AddListActionBarWhiteBtn
                            onPress={props.onListsPress}
                            ButtonLabel={'Collections'}
                        />
                    )}
                    <DeleteActionBarBtn
                        onPress={props.onDeletePress}
                        ButtonLabel={'Delete'}
                    />
                    <VisitActionBarBtn
                        onPress={props.onVisitPress}
                        ButtonLabel={'Visit'}
                    />
                </ActionBar>
            )}
        </View>
    )
}

export default ResultPage
