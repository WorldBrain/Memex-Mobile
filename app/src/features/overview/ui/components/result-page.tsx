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
import styled from 'styled-components/native'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'

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
        <ResultContainer>
            <ResultItem>
                <TopArea onPress={props.onReaderPress}>
                    <View>
                        <Body {...props} />
                        {/* <Tags tags={props.tags} /> */}
                    </View>
                    {props.lists.length > 0 && (
                        <SpacesArea>
                            {props.lists
                                .filter((item) => item !== 'Inbox')
                                .map((entry) => (
                                    <SpacePill key={entry}>
                                        <SpacePillText>{entry}</SpacePillText>
                                    </SpacePill>
                                ))}
                        </SpacesArea>
                    )}
                </TopArea>
                <Footer>
                    <AddSpacesContainer onPress={props.onListsPress}>
                        <Icon
                            icon={icons.Plus}
                            heightAndWidth={'14px'}
                            color={'purple'}
                            strokeWidth={'2px'}
                        />
                        <AddSpacesText>Add to Spaces</AddSpacesText>
                    </AddSpacesContainer>
                    <FooterRightSide>
                        <IconContainer onPress={props.onResultPress}>
                            {props.isResultPressed ? (
                                <Icon
                                    icon={icons.ForwardArrow}
                                    strokeWidth="6"
                                    heightAndWidth="22px"
                                />
                            ) : (
                                <Icon
                                    icon={icons.Dots}
                                    strokeWidth="4"
                                    heightAndWidth="15px"
                                />
                            )}
                        </IconContainer>
                        {props.isResultPressed && (
                            <MoreButtons>
                                <IconContainer onPress={props.onTagPress}>
                                    {props.tags.length > 0 ? (
                                        <Icon
                                            icon={icons.TagEmpty}
                                            height="18px"
                                            strokeWidth="3"
                                            fill
                                        />
                                    ) : (
                                        <Icon
                                            icon={icons.TagEmpty}
                                            strokeWidth="3"
                                            height="18px"
                                        />
                                    )}
                                </IconContainer>
                                <IconContainer onPress={props.onDeletePress}>
                                    <Icon
                                        icon={icons.Trash}
                                        strokeWidth="3"
                                        heightAndWidth="16px"
                                    />
                                </IconContainer>
                                <IconContainer onPress={props.onVisitPress}>
                                    <Icon
                                        icon={icons.Globe}
                                        strokeWidth="3"
                                        heightAndWidth="16px"
                                    />
                                </IconContainer>
                            </MoreButtons>
                        )}
                        <IconContainer onPress={props.onCommentPress}>
                            {props.notes.length > 0 ? (
                                <Icon
                                    icon={icons.Comment}
                                    strokeWidth="3"
                                    fill
                                    heightAndWidth="16px"
                                />
                            ) : (
                                <Icon
                                    icon={icons.Comment}
                                    strokeWidth="3"
                                    heightAndWidth="16px"
                                />
                            )}
                        </IconContainer>
                    </FooterRightSide>
                </Footer>
            </ResultItem>
        </ResultContainer>
    )
}

export default ResultPage

const MoreButtons = styled.View`
    display: flex;
    flex-direction: row;
`

const ResultContainer = styled.View`
    margin: 5px 0px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    shadow-opacity: 0.5;
    shadow-radius: 3px;
    shadow-color: #e0e0e0;
    shadow-offset: 0px 2px;
    border-radius: 8px;
    background: white;
    width: 600px;
    max-width: 100%;
    border-style: solid;
    border-width: 1px;
    border-color: ${(props) => props.theme.colors.lightgrey};
`

const ResultItem = styled.View`
    max-width: 600px;
    width: 100%;
`

const TopArea = styled.TouchableOpacity`
    padding: 15px 15px 5px 15px;
`

const Footer = styled.View`
    border-top-color: ${(props) => props.theme.colors.lightgrey};
    border-top-width: 1px;
    height: 40px;
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 0 15px;
`

const FooterRightSide = styled.View`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-direction: row;
`

const AddSpacesContainer = styled.TouchableOpacity`
    border-width: 2px;
    border-style: dotted;
    border-color: ${(props) => props.theme.colors.lightgrey}
    display: flex;
    justify-content: space-between;
    width: 124px;
    align-items: center;
    flex-direction: row;
    text-align-vertical: center;
    height: 30px;
    padding: 2px 8px;
`

const AddSpacesText = styled.Text`
color: ${(props) => props.theme.colors.purple};
font-size: 12px;
display: flex;
align-items flex-end;
flex-direction: row;
justify-content: center;
text-align-vertical: bottom;
`

const SpacesArea = styled.View`
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    flex-wrap: wrap;
    flex: 1;
`

const SpacePill = styled.View`
    padding: 3px 8px;
    background: ${(props) => props.theme.colors.purple};
    align-items: center;
    display: flex;
    text-align-vertical: center;
    margin-right: 3px;
    border-radius: 3px;
    margin-bottom: 5px;
`

const SpacePillText = styled.Text`
    color: white;
    display: flex;
    text-align-vertical: center;
    font-size: 12px;
`

const IconContainer = styled.TouchableOpacity`
    margin-left: 15px;
    height: 22px;
    width: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
`
