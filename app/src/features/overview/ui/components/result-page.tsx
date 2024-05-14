import React from 'react'
import { View, Platform, Share, Modal } from 'react-native'

import Body, { Props as BodyProps } from './result-page-body'
import type { TouchEventHandler } from 'src/ui/types'
import type { UIPage } from '../../types'
import styled from 'styled-components/native'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import AddToSpacesBtn from 'src/ui/components/add-to-spaces-btn'

export interface Props
    extends BodyProps,
        InteractionProps,
        Pick<UIPage, 'isResultPressed' | 'notes' | 'fullUrl'> {
    spacePills?: JSX.Element
}

export interface InteractionProps {
    onListsPress: TouchEventHandler
    onVisitPress: TouchEventHandler
    onDeletePress: TouchEventHandler
    onResultPress?: TouchEventHandler
    onReaderPress?: TouchEventHandler
    onCommentPress: TouchEventHandler
}

class ResultPage extends React.PureComponent<Props> {
    render() {
        return (
            <ResultItemContainer>
                <ResultContainer>
                    <ResultItem>
                        <TopArea onPress={this.props.onReaderPress}>
                            <View>
                                <Body {...this.props} />
                            </View>
                            {this.props.spacePills}
                        </TopArea>
                        <Footer>
                            <DateText>{this.props.date}</DateText>
                            <FooterRightSide>
                                <IconContainer
                                    onPress={this.props.onResultPress}
                                >
                                    <Icon
                                        icon={icons.Dots}
                                        strokeWidth="0"
                                        heightAndWidth="15px"
                                        color="greyScale4"
                                        fill
                                    />
                                </IconContainer>

                                <IconContainer
                                    onPress={this.props.onListsPress}
                                >
                                    <Icon
                                        icon={icons.Plus}
                                        strokeWidth="1"
                                        heightAndWidth="16px"
                                        color="prime1"
                                        fill
                                    />
                                </IconContainer>
                                <IconContainer
                                    onPress={this.props.onCommentPress}
                                >
                                    {this.props.notes &&
                                    this.props.notes?.length > 0 ? (
                                        <Icon
                                            icon={icons.CommentFull}
                                            strokeWidth="0"
                                            fill
                                            heightAndWidth="18px"
                                            color="prime1"
                                        />
                                    ) : (
                                        <Icon
                                            icon={icons.Comment}
                                            strokeWidth="0.2"
                                            heightAndWidth="18px"
                                            fill
                                            color="prime1"
                                        />
                                    )}
                                </IconContainer>
                            </FooterRightSide>
                        </Footer>
                    </ResultItem>
                </ResultContainer>
            </ResultItemContainer>
        )
    }
}

export default ResultPage

const ResultItemContainer = styled.View`
    position: relative;
`

const MoreActionTooltip = styled(Modal)`
    flex-direction: column;
    border-radius: 8px;
    background: ${(props) => props.theme.colors.greyScale2};
    border: 1px solid ${(props) => props.theme.colors.greyScale3};
    z-index: 1;
    height: 50px;
    width: 50px;
    bottom: 0px;
`

const MoreButtons = styled.View`
    display: flex;
    flex-direction: column;
`

const ResultContainer = styled.View`
    margin: 5px 0px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    border-radius: 8px;
    background: ${(props) => props.theme.colors.greyScale1};
    width: 600px;
    max-width: 100%;
    border-style: solid;
    border-width: 1px;
    border: none;
`

const ResultItem = styled.View`
    max-width: 600px;
    width: 100%;
`

const TopArea = styled.TouchableOpacity`
    padding: 15px 15px 5px 15px;
    margin-bottom: 5px;
`

const Footer = styled.View`
    border-top-color: ${(props) => props.theme.colors.greyScale2};
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

const IconContainer = styled.TouchableOpacity`
    margin-left: 15px;
    height: 22px;
    width: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const DateText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale4};
    font-weight: 400;
    font-size: 14px;
    font-family: 'Satoshi';
`
