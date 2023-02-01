import React from 'react'
import { Text, TouchableOpacity, LayoutChangeEvent } from 'react-native'

import Navigation from '../../components/navigation'
import Logic, { State, Props, Event } from './logic'
import { StatefulUIElement } from 'src/ui/types'
import NoteInput from 'src/features/page-share/ui/components/note-input-segment'
import styles from './styles'
import * as selectors from './selectors'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'
import AddToSpacesBtn from 'src/ui/components/add-to-spaces-btn'
import SpacePill from 'src/ui/components/space-pill'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { areArrayContentsEqual } from 'src/utils/are-arrays-the-same'
import AnnotationPrivacyBtn from 'src/ui/components/annot-privacy-btn'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'

export default class extends StatefulUIElement<Props, State, Event> {
    constructor(props: Props) {
        super(props, new Logic(props))
    }

    private get disableInputs(): boolean {
        return this.state.saveState === 'running'
    }

    private get showSaveBtn(): boolean {
        const { initSpaces, initNoteText, initPrivacyLevel, mode } = this
            .logic as Logic

        if (this.disableInputs) {
            return false
        }

        const noteInputDirty =
            this.state.noteText.trim() !== initNoteText.trim()

        const privacyLevelDirty = this.state.privacyLevel !== initPrivacyLevel

        if (mode === 'update') {
            return (
                this.state.noteText.trim().length !== 0 &&
                (noteInputDirty || privacyLevelDirty)
            )
        }
        return (
            this.state.noteText.trim().length !== 0 &&
            (noteInputDirty ||
                !areArrayContentsEqual(this.state.spacesToAdd, initSpaces))
        )
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
                    rightIcon={this.showSaveBtn && icons.CheckMark}
                    rightBtnPress={
                        this.showSaveBtn ? this.handleSaveBtnPress : undefined
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
                    {this.state.isSpacePickerShown ? (
                        <MetaPicker
                            storage={this.props.storage}
                            initSelectedEntries={this.state.spacesToAdd.map(
                                (space) => space.id,
                            )}
                            onEntryPress={(entry) =>
                                this.processEvent('selectSpacePickerEntry', {
                                    entry,
                                })
                            }
                        />
                    ) : (
                        <>
                            <TopBar>
                                <SpaceBar>
                                    <AddToSpacesBtn
                                        mini={this.state.spacesToAdd.length > 0}
                                        onPress={() =>
                                            this.processEvent(
                                                'setSpacePickerShown',
                                                { isShown: true },
                                            )
                                        }
                                    />
                                    {this.state.spacesToAdd.map((space) => (
                                        <SpacePill
                                            key={space.id}
                                            name={space.name}
                                            isShared={space.remoteId != null}
                                        />
                                    ))}
                                </SpaceBar>
                                <AnnotationPrivacyBtn
                                    actionSheetService={
                                        this.props.services.actionSheet
                                    }
                                    level={this.state.privacyLevel}
                                    hasSharedLists={this.state.spacesToAdd.some(
                                        (space) => space.remoteId != null,
                                    )}
                                    onPrivacyLevelChoice={(value) =>
                                        this.processEvent('setPrivacyLevel', {
                                            value,
                                        })
                                    }
                                />
                            </TopBar>
                            {this.renderHighlightText()}
                            <NoteInputEditorBox>
                                <NoteInputEditor
                                    onChange={this.handleInputChange}
                                    disabled={this.disableInputs}
                                    className={styles.noteInput}
                                    value={this.state.noteText}
                                />
                            </NoteInputEditorBox>
                        </>
                    )}
                </ScrollContainer>
            </Container>
        )
    }
}

const Container = styled.SafeAreaView`
    background: ${(props) => props.theme.colors.black};
`

const NoteInputEditorBox = styled.View`
    border-style: solid;
    border-width: 1px;
    border-color: ${(props) => props.theme.colors.greyScale3};
    height: 50%;
    max-height: 400px;
    margin: 0 10px;
    width: 620px;
    max-width: 100%;
`

const NoteInputEditor = styled(NoteInput)`
    background: red;
    margin: 20px;
    flex: 1;
    height: 100%;
`

const TopBar = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
`

const SpaceBar = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    overflow: scroll;
    padding-top: 10px;
`

const ScrollContainer = styled.View<{ highlightText: string | null }>`
    height: 100%;
    display: flex;
    padding-top: ${(props) => (props.highlightText ? '0px' : '10px')};
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    margin: 0 10px;
`

const AnnotationContainer = styled.View`
    padding-left: 10px;
    border-left-color: ${(props) => props.theme.colors.prime1 + '80'};
    border-left-width: 5px;
    border-style: solid;
    margin: 20px 0px 20px 20px;
    padding: 5px 5px 5px 10px;
    width: 620px;
    max-width: 100%;
`

const AnnotationHighlight = styled.Text`
    color: ${(props) => props.theme.colors.greyScale6};
    font-size: 14px;
    line-height: 18px;
`
