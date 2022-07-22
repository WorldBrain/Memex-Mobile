import React from 'react'

import * as actionBtns from 'src/features/overview/ui/components/action-btns'
import type { TouchEventHandler } from 'src/ui/types'
import type { State } from '../screens/reader/logic'
import styled from 'styled-components/native'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import AddToSpacesBtn from 'src/ui/components/add-to-spaces-btn'

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
            <ActionBox isLandscape={this.props.rotation === 'landscape'}>
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
            <Container isLandscape={this.props.rotation === 'landscape'}>
                <LeftBtns></LeftBtns>
                <CenterButton>
                    <AddToSpacesBtn
                        onPress={this.props.onListBtnPress}
                        spaceCount={this.props.spaceCount}
                    />
                </CenterButton>
                <RightBtns>{this.renderRightBtns()}</RightBtns>
            </Container>
        )
    }
}

export default ActionBar

export const heightLandscape = 60
export const heightPortrait = 32

const Container = styled.View<{ isLandscape?: boolean }>`
    position: absolute;
    bottom: ${(props) => (props.isLandscape ? '-105%' : '-100%')};
    width: 100%;
    height: ${(props) =>
        props.isLandscape ? heightLandscape : heightPortrait}px;
    padding: ${(props) => (props.isLandscape ? '0px 5%' : '0px 10%')};
    padding-top: ${(props) => (props.isLandscape ? '5px' : '10px')};
    display: flex;
    justify-content: space-between;
    align-items: ${(props) => (props.isLandscape ? 'flex-start' : 'center')};
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
    align-items: flex-start;
`

const LeftBtns = styled.View`
    width: 10%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

const IconContainer = styled.TouchableOpacity`
    height: 40px;
    width: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const ActionBox = styled.View<{ isLandscape?: boolean }>`
    height: 50px;
    display: flex;
    justify-content: flex-end;
    align-items: ${(props) => (props.isLandscape ? 'flex-start' : 'center')};
    flex-direction: row;
`

const CenterButton = styled.View`
    margin-top: 5px;
`

const LoadingIndicatorBox = styled.View`
    margin-right: 5px;
`
