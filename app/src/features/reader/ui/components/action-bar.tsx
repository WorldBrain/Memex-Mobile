import React from 'react'
import { View } from 'react-native'

import * as actionBtns from 'src/features/overview/ui/components/action-btns'
import { TouchEventHandler } from 'src/ui/types'
import styles from './action-bar.styles'
import { State } from '../screens/reader/logic'
import styled from 'styled-components/native'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import LoadingIndicator from 'src/ui/components/loading-balls'

export interface Props
    extends Pick<State, 'isBookmarked' | 'isTagged' | 'isListed' | 'hasNotes'> {
    className?: string
    selectedText?: string
    isErrorView?: boolean
    onBackBtnPress: TouchEventHandler
    onBookmarkBtnPress: TouchEventHandler
    onHighlightBtnPress: TouchEventHandler
    onAnnotateBtnPress: TouchEventHandler
    onCommentBtnPress: TouchEventHandler
    onTagBtnPress: TouchEventHandler
    onListBtnPress: TouchEventHandler
    spaces: []
}

class ActionBar extends React.PureComponent<Props> {
    private get BookmarkBtn(): actionBtns.ActionBtnComponent {
        return this.props.isBookmarked
            ? actionBtns.StarBtnFull
            : actionBtns.StarBtn
    }

    private get TagBtn(): actionBtns.ActionBtnComponent {
        return this.props.isTagged ? actionBtns.TagBtnFull : actionBtns.TagBtn
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
                    <actionBtns.HighlightBtn
                        onPress={this.props.onHighlightBtnPress}
                        className={styles.actionBtn}
                    />
                    <actionBtns.AnnotateBtn
                        onPress={this.props.onAnnotateBtnPress}
                        className={styles.actionBtn}
                    />
                </>
            )
        }

        return (
            <ActionBox>
                <IconContainer>
                    {this.props.isTagged ? (
                        <Icon
                            icon={icons.TagFull}
                            strokeWidth="3"
                            fill
                            heightAndWidth="30px"
                        />
                    ) : (
                        <Icon
                            icon={icons.TagEmpty}
                            strokeWidth="3"
                            heightAndWidth="30px"
                        />
                    )}
                </IconContainer>
                <IconSpacer />
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
            <Container>
                <LeftBtns>
                    <IconContainer onPress={this.props.onBackBtnPress}>
                        <Icon
                            icon={icons.BackArrow}
                            strokeWidth="7"
                            heightAndWidth="40px"
                        />
                    </IconContainer>
                </LeftBtns>
                <CenterButton>
                    <AddSpacesContainer onPress={this.props.onListBtnPress}>
                        {!this.props.spaces.length ? (
                            <LoadingIndicatorBox>
                                <LoadingIndicator size={15} />
                            </LoadingIndicatorBox>
                        ) : (
                            <>
                                {this.props.spaces.length === 0 ? (
                                    <>
                                        <Icon
                                            icon={icons.Plus}
                                            heightAndWidth={'14px'}
                                            color={'purple'}
                                            strokeWidth={'2px'}
                                        />
                                    </>
                                ) : (
                                    <SpacesCounterPill>
                                        <SpacesCounterText>
                                            {this.props.spaces.length}
                                        </SpacesCounterText>
                                    </SpacesCounterPill>
                                )}
                            </>
                        )}
                        <AddSpacesText>Add Page to Spaces</AddSpacesText>
                    </AddSpacesContainer>
                </CenterButton>
                <RightBtns>{this.renderRightBtns()}</RightBtns>
            </Container>
        )
    }
}

export default ActionBar

const Container = styled.View`
    height: 60px;
    padding: 0px 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
`

const IconSpacer = styled.View`
    width: 50px;
`

const RightBtns = styled.View`
    width: 250px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
`

const LeftBtns = styled.View`
    width: 250px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

const IconContainer = styled.TouchableOpacity``

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
    width: 140px;
    text-align: right;
`

const LoadingIndicatorBox = styled.View`
    margin-right: 5px;
`
