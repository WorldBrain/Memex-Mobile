import React from 'react'
import { View } from 'react-native'

import * as actionBtns from 'src/features/overview/ui/components/action-btns'
import { TouchEventHandler } from 'src/ui/types'
import styles from './action-bar.styles'
import { State } from '../screens/reader/logic'

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
}

class ActionBar extends React.PureComponent<Props> {
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
            <>
                <this.AnnotateBtn
                    onPress={this.props.onCommentBtnPress}
                    className={styles.actionBtn}
                />
                <this.TagBtn
                    onPress={this.props.onTagBtnPress}
                    className={styles.actionBtn}
                />
                <this.ListBtn
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
