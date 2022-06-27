import React from 'react'
import { View } from 'react-native'

import Body, { Props as BodyProps } from './result-page-body'
import type { Props as FooterProps } from './result-footer'
import type { TouchEventHandler } from 'src/ui/types'
import type { UIPage } from '../../types'
import styled from 'styled-components/native'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'

export interface Props extends FooterProps, BodyProps, UIPage {
    spacePills?: JSX.Element
}

export interface InteractionProps {
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
                    </View>
                    {props.spacePills}
                </TopArea>
                <Footer>
                    <AddSpacesContainer onPress={props.onListsPress}>
                        <Icon
                            icon={icons.Plus}
                            color={'purple'}
                            strokeWidth={'2px'}
                            heightAndWidth={'14px'}
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
    min-height: 145px;
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

const IconContainer = styled.TouchableOpacity`
    margin-left: 15px;
    height: 22px;
    width: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
`
