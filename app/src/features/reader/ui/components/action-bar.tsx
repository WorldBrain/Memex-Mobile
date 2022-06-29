import React from 'react'

import * as actionBtns from 'src/features/overview/ui/components/action-btns'
import { TouchEventHandler } from 'src/ui/types'
import { State } from '../screens/reader/logic'
import styled from 'styled-components/native'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'

export interface Props
    extends Pick<State, 'isBookmarked' | 'isListed' | 'hasNotes' | 'rotation'> {
    className?: string
    selectedText?: string
    isErrorView?: boolean
    onBackBtnPress: TouchEventHandler
    onBookmarkBtnPress: TouchEventHandler
    onHighlightBtnPress: TouchEventHandler
    onAnnotateBtnPress: TouchEventHandler
    onCommentBtnPress: TouchEventHandler
    onListBtnPress: TouchEventHandler
    spaceCount: number
}

class ActionBar extends React.PureComponent<Props> {
    private get BookmarkBtn(): actionBtns.ActionBtnComponent {
        return this.props.isBookmarked
            ? actionBtns.StarBtnFull
            : actionBtns.StarBtn
    }

    private get ListBtn(): actionBtns.ActionBtnComponent {
        return this.props.isListed
            ? actionBtns.AddListBtnFull
            : actionBtns.AddListBtn
    }

    private get AnnotateBtn(): actionBtns.ActionBtnComponent {
        return this.props.hasNotes
            ? actionBtns.AnnotateBtnFull
            : actionBtns.AnnotateBtn
    }

    private renderRightBtns() {
        if (this.props.isErrorView) {
            return null
        }

        if (this.props.selectedText != null) {
            return (
                <>
                    <IconContainer onPress={this.props.onHighlightBtnPress}>
                        <Icon
                            icon={icons.Highlighter}
                            strokeWidth="3"
                            heightAndWidth="24px"
                        />
                    </IconContainer>
                    <IconContainer onPress={this.props.onAnnotateBtnPress}>
                        <Icon
                            icon={icons.AddNote}
                            strokeWidth="3"
                            heightAndWidth="24px"
                        />
                    </IconContainer>
                </>
            )
        }

        return (
            <ActionBox>
                <IconContainer onPress={this.props.onCommentBtnPress}>
                    {this.props.hasNotes ? (
                        <Icon
                            icon={icons.Comment}
                            strokeWidth="3"
                            heightAndWidth="24px"
                            fill
                        />
                    ) : (
                        <Icon
                            icon={icons.Comment}
                            strokeWidth="3"
                            heightAndWidth="24px"
                        />
                    )}
                </IconContainer>

                {/* <IconContainer>
                    {this.props.isListed ? (
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
                </IconContainer> */}
            </ActionBox>
        )
    }

    render() {
        return (
            <Container rotation={this.props.rotation}>
                <LeftBtns></LeftBtns>
                <CenterButton>
                    <AddSpacesContainer onPress={this.props.onListBtnPress}>
                        {this.props.spaceCount === 0 ? (
                            <Icon
                                icon={icons.Plus}
                                heightAndWidth="14px"
                                strokeWidth="2px"
                                color="purple"
                            />
                        ) : (
                            <SpacesCounterPill>
                                <SpacesCounterText>
                                    {this.props.spaceCount}
                                </SpacesCounterText>
                            </SpacesCounterPill>
                        )}
                        <AddSpacesText>Add to Spaces</AddSpacesText>
                    </AddSpacesContainer>
                </CenterButton>
                <RightBtns>{this.renderRightBtns()}</RightBtns>
            </Container>
        )
    }
}

export default ActionBar

const Container = styled.View<Pick<Props, 'rotation'>>`
    position: absolute;
    bottom: ${(props) => (props.rotation === 'landscape' ? '-105%' : '-100%')};
    width: 100%;
    height: 60px;
    padding: 0px 5%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    background-color: #fff;
    border-style: solid;
    border-top-width: 1px;
    border-color: ${(props) => props.theme.colors.lightgrey};
`

const IconSpacer = styled.View`
    width: 10%;
`

const RightBtns = styled.View`
    width: 10%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
`

const LeftBtns = styled.View`
    width: 10%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

const IconContainer = styled.TouchableOpacity`
    height: 50px;
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const ActionBox = styled.View`
    height: 50px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-direction: row;
`

const CenterButton = styled.View``

const SpacesCounterPill = styled.View`
    padding: 1px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: ${(props) => props.theme.colors.purple}
    border-radius: 50px;
    margin-right: 5px;
`

const SpacesCounterText = styled.Text`
    color: white;
    font-weight: 600;
    text-align: center;
    font-size: 12px;
`

const AddSpacesContainer = styled.TouchableOpacity`
    border-width: 2px;
    border-style: dotted;
    border-color: ${(props) => props.theme.colors.lightgrey}
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    text-align-vertical: center;
    height: 30px;
    padding: 2px 8px;
`

const AddSpacesText = styled.Text`
    color: ${(props) => props.theme.colors.purple};
    font-size: 14px;
    display: flex;
    align-items flex-end;
    flex-direction: row;
    justify-content: flex-end;
    text-align-vertical: bottom;
    width: 100px;
    text-align: right;
`

const LoadingIndicatorBox = styled.View`
    margin-right: 5px;
`
