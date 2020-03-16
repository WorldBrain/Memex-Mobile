import React from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    LayoutChangeEvent,
    ScrollView,
} from 'react-native'

import Navigation from '../../components/navigation'
import Logic, { State, Props, Event } from './logic'
import { NavigationScreen } from 'src/ui/types'
import NoteInput from 'src/features/page-share/ui/components/note-input-segment'
import styles from './styles'
import * as selectors from './selectors'
import navigationStyles from 'src/features/overview/ui/components/navigation.styles'

export default class NoteEditorScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private get disableInputs(): boolean {
        return this.state.saveState === 'running'
    }

    private handleBackBtnPress = () => this.processEvent('goBack', {})

    private handleSaveBtnPress = () => this.processEvent('saveNote', {})

    private handleHighlightTextLayoutChange = ({
        nativeEvent,
    }: LayoutChangeEvent) => {
        const { height } = nativeEvent.layout

        this.processEvent('setHighlightTextLines', {
            lines: height / styles.highlightText.lineHeight,
        })
    }

    private handleInputChange = (value: string) =>
        this.processEvent('changeNoteText', { value })

    private handleShowMorePress = () => {
        this.processEvent('setShowAllText', { show: !this.state.showAllText })
    }

    private renderShowMore() {
        if (!selectors.showMoreButton(this.state)) {
            return
        }

        const text = this.state.showAllText ? 'Show Less' : 'Show More'

        return (
            <TouchableOpacity onPress={this.handleShowMorePress}>
                <Text style={styles.showMoreText}>{text}</Text>
            </TouchableOpacity>
        )
    }

    private renderHighlightText() {
        if (this.state.highlightText == null) {
            return
        }

        return (
            <View style={styles.highlightTextContainer}>
                <Text
                    style={styles.highlightText}
                    onLayout={this.handleHighlightTextLayoutChange}
                    numberOfLines={
                        this.state.showAllText
                            ? undefined
                            : Logic.HIGHLIGHT_MAX_LINES
                    }
                >
                    {this.state.highlightText}
                </Text>
                {this.renderShowMore()}
            </View>
        )
    }

    render() {
        return (
            <>
                <Navigation
                    titleText={
                        (this.logic as Logic).mode === 'create'
                            ? 'Add Note'
                            : 'Edit Note'
                    }
                    renderLeftIcon={() => (
                        <TouchableOpacity
                            onPress={this.handleBackBtnPress}
                            disabled={this.disableInputs}
                            style={navigationStyles.btnContainer}
                        >
                            <Image
                                resizeMode="contain"
                                style={navigationStyles.backIcon}
                                source={require('src/ui/img/arrow-back.png')}
                            />
                        </TouchableOpacity>
                    )}
                    renderRightIcon={() => (
                        <TouchableOpacity
                            onPress={this.handleSaveBtnPress}
                            style={navigationStyles.btnContainer}
                            disabled={
                                this.disableInputs ||
                                !this.state.noteText?.trim().length
                            }
                        >
                            <Image
                                resizeMode="contain"
                                style={
                                    this.disableInputs ||
                                    !this.state.noteText?.trim().length
                                        ? navigationStyles.disabled
                                        : navigationStyles.checkIcon
                                }
                                source={require('src/ui/img/tick.png')}
                            />
                        </TouchableOpacity>
                    )}
                />
                <ScrollView style={styles.container}>
                    {this.renderHighlightText()}
                    <NoteInput
                        containerClassName={styles.noteInputContainer}
                        onChange={this.handleInputChange}
                        disabled={this.disableInputs}
                        className={styles.noteInput}
                        value={this.state.noteText}
                    />
                </ScrollView>
            </>
        )
    }
}
