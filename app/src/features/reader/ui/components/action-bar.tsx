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

    render() {
        return (
            <FooterActionBar>
                <FooterActionBtn onPress={this.props.onCommentBtnPress}>
                    {this.props.hasNotes ? (
                        <Icon
                            icon={icons.CommentFull}
                            strokeWidth="0"
                            fill
                            heightAndWidth="18px"
                            color="greyScale5"
                        />
                    ) : (
                        <Icon
                            icon={icons.Comment}
                            strokeWidth="0.2"
                            heightAndWidth="18px"
                            fill
                            color="greyScale5"
                        />
                    )}
                    <FooterActionText>Notes</FooterActionText>
                </FooterActionBtn>
                <FooterActionBtn onPress={this.props.onListBtnPress}>
                    {this.props.spaceCount > 0 && (
                        <SpaceCounterPill>
                            <SpaceCounterPillText>
                                {this.props.spaceCount}
                            </SpaceCounterPillText>
                        </SpaceCounterPill>
                    )}
                    <Icon
                        icon={icons.SpacesEmtpy}
                        strokeWidth="0"
                        heightAndWidth="18px"
                        color="greyScale5"
                        fill
                    />
                    <FooterActionText>Spaces</FooterActionText>
                </FooterActionBtn>
                {this.props.selectedText != null && (
                    <>
                        <FooterActionBtn
                            onPress={this.props.onHighlightBtnPress}
                        >
                            <Icon
                                icon={icons.Highlighter}
                                strokeWidth="0"
                                heightAndWidth="18px"
                                color="greyScale5"
                                fill
                            />
                            <FooterActionText>Highlight</FooterActionText>
                        </FooterActionBtn>
                        <FooterActionBtn
                            onPress={this.props.onAnnotateBtnPress}
                        >
                            <Icon
                                icon={icons.AddNote}
                                strokeWidth="0"
                                heightAndWidth="18px"
                                color="greyScale5"
                                fill
                            />
                            <FooterActionText>Annotate</FooterActionText>
                        </FooterActionBtn>
                    </>
                )}
            </FooterActionBar>
            // <Container isLandscape={this.props.rotation === 'landscape'}>
            //     <LeftBtns></LeftBtns>
            //     <CenterButton>
            //         <AddToSpacesBtn
            //             onPress={this.props.onListBtnPress}
            //             spaceCount={this.props.spaceCount}
            //         />
            //     </CenterButton>
            //     <RightBtns>{this.renderRightBtns()}</RightBtns>
            // </Container>
        )
    }
}

export default ActionBar

export const heightLandscape = 60
export const heightPortrait = 45

const SpaceCounterPill = styled.View`
    background: ${(props) => props.theme.colors.prime1};
    border-radius: 10px;
    padding: 2px 6px;
    display: flex;
    position: absolute;
    justify-content: center;
    align-items: center;
    right: 2px;
    top: -3px;
    z-index: 1;
`

const SpaceCounterPillText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale1};
    font-size: 8px;
    font-weight: 600;
`

const FooterActionBtn = styled.TouchableOpacity`
    display: flex;
    margin: 10px;
    position: relative;
`
const FooterActionBar = styled.View`
    display: flex;
    flex-direction: row;
    background: ${(props) => props.theme.colors.greyScale1};
    border: 1px solid ${(props) => props.theme.colors.greyScale2};
    border-radius: 10px;

    position: absolute;
    bottom: 0px;
    padding: 0 10px;
`

const FooterActionText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale4};
    font-size: 12px;
    margin-top: 4px;
    font-weight: 400;
`

const Container = styled.View<{ isLandscape?: boolean }>`
    position: absolute;
    bottom: ${(props) => (props.isLandscape ? '-105%' : '-100%')};
    width: 100%;
    height: ${(props) =>
        props.isLandscape ? heightLandscape : heightPortrait}px;
    padding: ${(props) => (props.isLandscape ? '0px 5%' : '0px 5%')};
    padding-top: ${(props) => (props.isLandscape ? '5px' : '5px')};
    display: flex;
    justify-content: space-between;
    align-items: ${(props) => (props.isLandscape ? 'flex-start' : 'center')};
    flex-direction: row;
    background-color: #fff;
    border-style: solid;
    border-top-width: 1px;
    border-color: ${(props) => props.theme.colors.greyScale5};
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
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 5px;
`

const ActionBox = styled.View<{ isLandscape?: boolean }>`
    height: 50px;
    display: flex;
    justify-content: flex-end;
    align-items: ${(props) => (props.isLandscape ? 'flex-start' : 'center')};
    flex-direction: row;
    width: 100px;
`

const CenterButton = styled.View`
    margin-top: 5px;
`

const LoadingIndicatorBox = styled.View`
    margin-right: 5px;
`
