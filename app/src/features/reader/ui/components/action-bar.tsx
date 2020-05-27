import React from 'react'
import { View } from 'react-native'

import * as actionBtns from 'src/features/overview/ui/components/action-btns'
import { NativeTouchEventHandler } from 'src/features/overview/types'
import styles from './action-bar.styles'

export interface Props {
    className?: string
    isTagged?: boolean
    isBookmarked?: boolean
    isTextSelected?: boolean
    onBackBtnPress: NativeTouchEventHandler
    onBookmarkBtnPress: NativeTouchEventHandler
    onHighlightBtnPress: NativeTouchEventHandler
    onAnnotateBtnPress: NativeTouchEventHandler
    onCommentBtnPress: NativeTouchEventHandler
    onTagBtnPress: NativeTouchEventHandler
    onListBtnPress: NativeTouchEventHandler
}

class ActionBar extends React.PureComponent<Props> {
    private get BookmarkBtn(): actionBtns.ActionBtnComponent {
        return this.props.isBookmarked
            ? actionBtns.FullStarBtn
            : actionBtns.StarBtn
    }

    private get TagBtn(): actionBtns.ActionBtnComponent {
        return this.props.isTagged ? actionBtns.FullTagBtn : actionBtns.TagBtn
    }

    private renderRightBtns() {
        if (this.props.isTextSelected) {
            return (
                <>
                    <actionBtns.HighlightBtn
                        onPress={this.props.onHighlightBtnPress}
                        className={styles.actionBtn}
                    />
                    <actionBtns.CommentBtn
                        onPress={this.props.onAnnotateBtnPress}
                        className={styles.actionBtn}
                    />
                </>
            )
        }

        return (
            <>
                <this.BookmarkBtn
                    onPress={this.props.onBookmarkBtnPress}
                    className={styles.actionBtn}
                />
                <actionBtns.CommentBtn
                    onPress={this.props.onCommentBtnPress}
                    className={styles.actionBtn}
                />
                <this.TagBtn
                    onPress={this.props.onTagBtnPress}
                    className={styles.actionBtn}
                />
                <actionBtns.ListBtn
                    onPress={this.props.onListBtnPress}
                    className={styles.actionBtn}
                />
            </>
        )
    }

    render() {
        return (
            <View style={[styles.container, this.props.className]}>
                <View style={styles.leftBtns}>
                    <actionBtns.BackBtn
                        onPress={this.props.onBackBtnPress}
                        className={styles.actionBtn}
                    />
                </View>
                <View style={styles.rightBtns}>{this.renderRightBtns()}</View>
            </View>
        )
    }
}

export default ActionBar
