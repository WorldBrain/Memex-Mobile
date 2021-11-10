import React from 'react'
import { View, TouchableWithoutFeedback, Text } from 'react-native'

import Container from './result-container'
import Body, { Props as BodyProps } from './result-page-body'
import type { Props as FooterProps } from './result-footer'
import Tags from './result-page-tags'
import {
    DeleteActionBarBtn,
    TagBtnFullWhite,
    TagBtnWhite,
    CommentBtn,
    FullCommentBtn,
    FullListActionBarWhiteBtn,
    AddListActionBarWhiteBtn,
    ReaderActionBarBtn,
    VisitActionBarBtn,
} from './action-btns'
import ActionBar from './result-page-action-bar'
import type { TouchEventHandler } from 'src/ui/types'
import styles from './result-page-view-button.styles'
import type { UIPage } from '../../types'

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
                                fullyOpaque
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
                            label={'Annotate'}
                            disabled={props.type !== 'page'}
                        />
                    )}
                    {props.tags.length > 0 ? (
                        <TagBtnFullWhite
                            onPress={props.onTagPress}
                            label={'Tags'}
                        />
                    ) : (
                        <TagBtnWhite
                            onPress={props.onTagPress}
                            label={'Tags'}
                        />
                    )}
                    {props.lists.length > 0 ? (
                        <FullListActionBarWhiteBtn
                            onPress={props.onListsPress}
                            label={'Collections'}
                        />
                    ) : (
                        <AddListActionBarWhiteBtn
                            onPress={props.onListsPress}
                            label={'Collections'}
                        />
                    )}
                    <DeleteActionBarBtn
                        onPress={props.onDeletePress}
                        label={'Delete'}
                    />
                    <VisitActionBarBtn
                        onPress={props.onVisitPress}
                        label={'Visit'}
                        disabled={props.type === 'pdf-local'}
                    />
                </ActionBar>
            )}
        </View>
    )
}

export default ResultPage
