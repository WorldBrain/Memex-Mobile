import React from 'react'

import * as actionBtns from 'src/features/overview/ui/components/action-btns'
import type { TouchEventHandler } from 'src/ui/types'
import type { State } from '../screens/reader/logic'
import styled from 'styled-components/native'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import AddToSpacesBtn from 'src/ui/components/add-to-spaces-btn'
import { DeviceDetails } from 'src/features/page-share/ui/screens/share-modal/util'
import { css } from 'styled-components'

export interface Props
    extends Pick<State, 'isBookmarked' | 'isListed' | 'hasNotes'> {
    className?: string
    selectedText?: string
    isErrorView?: boolean
    onBackBtnPress: TouchEventHandler
    onBookmarkBtnPress: TouchEventHandler
    onHighlightBtnPress: TouchEventHandler
    createYoutubeTimestamp: TouchEventHandler
    onAnnotateBtnPress: TouchEventHandler
    onCommentBtnPress: TouchEventHandler
    onAIButtonPress: TouchEventHandler
    onListBtnPress: TouchEventHandler
    spaceCount: number
    pageUrl: string
    deviceInfo: DeviceDetails | null
    AIisOpen: boolean
}

interface LocalState {
    showHighlightNotif: boolean
}

class ActionBar extends React.PureComponent<Props, LocalState> {
    state: LocalState = {
        showHighlightNotif: false,
    }
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
            <FooterActionBar
                os={this.props.deviceInfo?.isIos ? 'ios' : 'android'}
                deviceOrientation={
                    this.props.deviceInfo?.deviceOrientation ?? 'portrait'
                }
                deviceType={this.props.deviceInfo?.isPhone ? 'phone' : 'tablet'}
            >
                <LeftSideActions>
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
                </LeftSideActions>
                <FooterActionBtn
                    width={'70px'}
                    onPress={this.props.onAIButtonPress}
                >
                    {this.props.AIisOpen ? (
                        <Icon
                            icon={icons.BackArrow}
                            strokeWidth="0"
                            heightAndWidth="18px"
                            color="greyScale5"
                            fill
                            rotate="270deg"
                        />
                    ) : (
                        <Icon
                            icon={icons.Feed}
                            strokeWidth="0"
                            heightAndWidth="18px"
                            color="greyScale5"
                            fill
                        />
                    )}
                    <FooterActionText>Ask</FooterActionText>
                </FooterActionBtn>
                <RightSideActions>
                    {this.state.showHighlightNotif ? (
                        <ShowHighlightNotifText>
                            Select some text first
                        </ShowHighlightNotifText>
                    ) : (
                        <>
                            {this.props.pageUrl?.includes(
                                'youtube.com/watch',
                            ) ? (
                                <>
                                    <FooterActionBtn></FooterActionBtn>
                                    <FooterActionBtn
                                        onPress={(e) => {
                                            this.props.onHighlightBtnPress(e)
                                        }}
                                    >
                                        <Icon
                                            icon={icons.Highlighter}
                                            strokeWidth="0"
                                            heightAndWidth="18px"
                                            color="greyScale5"
                                            fill
                                        />
                                        <FooterActionText>
                                            Highlight
                                        </FooterActionText>
                                    </FooterActionBtn>
                                </>
                            ) : (
                                <>
                                    <FooterActionBtn
                                        onPress={(e) => {
                                            if (
                                                this.props.selectedText == null
                                            ) {
                                                this.setState({
                                                    showHighlightNotif: true,
                                                })
                                                setTimeout(() => {
                                                    this.setState({
                                                        showHighlightNotif: false,
                                                    })
                                                }, 2000)
                                            } else {
                                                this.props.onHighlightBtnPress(
                                                    e,
                                                )
                                            }
                                        }}
                                    >
                                        <Icon
                                            icon={icons.Highlighter}
                                            strokeWidth="0"
                                            heightAndWidth="18px"
                                            color="greyScale5"
                                            fill
                                        />
                                        <FooterActionText>
                                            Highlight
                                        </FooterActionText>
                                    </FooterActionBtn>
                                    <FooterActionBtn
                                        onPress={(e) => {
                                            if (
                                                this.props.selectedText == null
                                            ) {
                                                this.setState({
                                                    showHighlightNotif: true,
                                                })
                                                setTimeout(() => {
                                                    this.setState({
                                                        showHighlightNotif: false,
                                                    })
                                                }, 2000)
                                            } else {
                                                this.props.onAnnotateBtnPress(e)
                                            }
                                        }}
                                    >
                                        <Icon
                                            icon={icons.AddNote}
                                            strokeWidth="0"
                                            heightAndWidth="18px"
                                            color="greyScale5"
                                            fill
                                        />
                                        <FooterActionText>
                                            Annotate
                                        </FooterActionText>
                                    </FooterActionBtn>
                                </>
                            )}
                        </>
                    )}
                </RightSideActions>
            </FooterActionBar>
            // <Container isLandscape={this.props.deviceOrientation === 'landscape'}>
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

const ShowHighlightNotifText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale5};
    font-size: 14px;
    font-weight: 400;
    align-content: center;
    align-self: center;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 10px;
`

const RightSideActions = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`
const LeftSideActions = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`

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

const FooterActionBtn = styled.TouchableOpacity<{ width?: string }>`
    display: flex;
    padding: 10px;
    position: relative;
    width: ${(props) => (props.width ? props.width : '78px')};
    justify-content: center;
    align-items: center;
`
const FooterActionBar = styled.View<{
    os: 'ios' | 'android'
    deviceOrientation: 'landscape' | 'portrait'
    deviceType?: 'phone' | 'tablet'
}>`
    display: flex;
    flex-direction: row;
    justify-content: center;
    background: ${(props) => props.theme.colors.greyScale1};
    border-style: solid;
    border-top-width: 1px;
    border-color: ${(props) => props.theme.colors.greyScale2};

    position: absolute;
    bottom: 0px;
    padding: 0 20px;
    width: 100%;

    ${(props) =>
        props.deviceOrientation === 'landscape' &&
        props.deviceType === 'phone' &&
        css<any>`
            width: 130%;
            padding: 0 120px;
        `};
`

const FooterActionText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale6};
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
