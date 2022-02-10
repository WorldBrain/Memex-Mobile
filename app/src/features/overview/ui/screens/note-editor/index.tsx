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
import { StatefulUIElement } from 'src/ui/types'
import NoteInput from 'src/features/page-share/ui/components/note-input-segment'
import styles from './styles'
import * as selectors from './selectors'
import navigationStyles from 'src/features/overview/ui/components/navigation.styles'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'

export default class extends StatefulUIElement<Props, State, Event> {
    constructor(props: Props) {
        super(props, new Logic(props))
    }

    private get disableInputs(): boolean {
        return this.state.saveState === 'running'
    }

    private get disableSaveBtn(): boolean {
        const logic = this.logic as Logic
        if (
            logic.mode === 'update' &&
            logic.initNoteText === this.state.noteText
        ) {
            return true
        }

        if (logic.highlightAnchor == null) {
            return this.disableInputs || !this.state.noteText?.trim().length
        }

        return this.disableInputs
    }

    private get titleText(): string {
        const logic = this.logic as Logic
        if (logic.mode === 'create') {
            return logic.highlightAnchor == null ? 'Add Note' : 'Add Annotation'
        }

        return 'Edit Note'
    }

    private handleBackBtnPress = () => this.processEvent('goBack', null)

    private handleSaveBtnPress = () => this.processEvent('saveNote', null)

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
            <AnnotationContainer>
                <AnnotationHighlight
                    onLayout={this.handleHighlightTextLayoutChange}
                    numberOfLines={
                        this.state.showAllText
                            ? undefined
                            : Logic.HIGHLIGHT_MAX_LINES
                    }
                >
                    {this.state.highlightText}
                </AnnotationHighlight>
                {this.renderShowMore()}
            </AnnotationContainer>
        )
    }

    render() {
        return (
            <Container>
                <Navigation
                    leftIcon={icons.BackArrow}
                    leftBtnPress={this.handleBackBtnPress}
                    leftIconSize={'30px'}
                    leftIconStrokeWidth={'8px'}
                    rightIcon={
                        this.state.noteText.length > 0 && icons.CheckMark
                    }
                    rightBtnPress={
                        this.state.noteText.length > 0 &&
                        this.handleSaveBtnPress
                    }
                    rightIconColor={'purple'}
                    rightIconSize={'24px'}
                    rightIconStrokeWidth={'3px'}
                    titleText={this.titleText}
                    // renderRightIcon={() => (
                    //     <TouchableOpacity
                    //         onPress={this.handleSaveBtnPress}
                    //         style={navigationStyles.btnContainer}
                    //         disabled={this.disableSaveBtn}
                    //     >
                    //         <Image
                    //             resizeMode="contain"
                    //             style={
                    //                 this.disableSaveBtn
                    //                     ? navigationStyles.disabled
                    //                     : navigationStyles.checkIcon
                    //             }
                    //             source={require('src/ui/img/tick.png')}
                    //         />
                    //     </TouchableOpacity>
                    // )}
                />
                <ScrollContainer highlightText={this.state.highlightText}>
                    {this.renderHighlightText()}
                    <NoteInputEditor
                        onChange={this.handleInputChange}
                        disabled={this.disableInputs}
                        className={styles.noteInput}
                        value={this.state.noteText}
                    />
                </ScrollContainer>
            </Container>
        )
    }
}

const Container = styled.SafeAreaView`
    background: ${(props) => props.theme.colors.backgroundColor};
`

const NoteInputEditor = styled(NoteInput)`
    background: white;
    margin: 20px;
`

const ScrollContainer = styled.ScrollView<{ highlightText: string }>`
    height: 100%;
    display: flex;
    padding-top: ${(props) => (props.highlightText ? '0px' : '10px')};
`

const AnnotationContainer = styled.View`
    padding-left: 10px;
    border-left-color: ${(props) => props.theme.colors.purple + '80'};
    border-left-width: 5px;
    border-style: solid;
    margin: 20px 0px 20px 20px;
    padding: 5px 5px 5px 10px;
`

const AnnotationHighlight = styled.Text`
    color: ${(props) => props.theme.colors.darkerText};
    font-size: 14px;
    line-height: 18px;
`
