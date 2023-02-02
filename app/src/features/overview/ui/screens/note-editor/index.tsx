import React from 'react'
import {
    Text,
    TouchableOpacity,
    LayoutChangeEvent,
    Dimensions,
    useWindowDimensions,
} from 'react-native'

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
import RenderHtml from 'react-native-render-html'

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
                <VerticalBar />
                <TextContainer>
                    <RenderHtml
                        contentWidth={Dimensions.get('screen').width - 40}
                        source={{
                            html: '<div>' + this.state.highlightText + '</div>',
                        }}
                    />
                </TextContainer>
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
    margin: 20px 0px 20px 20px;
    padding: 5px 5px 5px 10px;
    max-width: 620px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
`

const VerticalBar = styled.View`
    background: ${(props) => props.theme.colors.prime1};
    border-radius: 3px;
    max-width: 4px;
    flex: 1;
    height: auto;
    display: flex;
    margin-right: 10px;
`
// const TextContainer = styled.View`
//     width: 90%;
//     display: flex;
//     margin: -10px 0px;
// `

const AnnotationHighlight = styled.Text`
    color: ${(props) => props.theme.colors.greyScale6};
    font-size: 14px;
    line-height: 18px;
`

const TextContainer = styled.View`
    width: 90%;
    display: flex;
    margin: -10px 0px;
    color: ${(props) => props.theme.colors.white};
    line-height: 20px;

    .WikiLink {
        text-decoration: none;
    }

    .a {
        text-decoration: none;
    }

    & * {
        line-height: 20px;
        white-space: pre-wrap;
        word-break: break-word;
        hyphens: none;
        letter-spacing: 0.8px;
        color: ${(props) => props.theme.colors.white};
    }

    & img {
        max-width: fill-available;
        width: auto;
        height: auto;
        border: 1px solid #e0e0e0;
        border-radius: 3px;
    }

    & li {
        line-height: 20px;
        margin-left: -15px;
    }

    & p {
        margin-block-start: 0.5em;
        margin-block-end: 0.5em;
        line-height: 20px;
        hyphens: none;
        font-size: 14px;

        & img {
            height: auto;
            max-width: fill-available;
            width: auto;
            background: white;
            max-height: 250px;
        }
    }

    & ul {
        margin-block-start: 0.5em;
        margin-block-end: 0.5em;
    }

    & p {
        margin-block-start: 0.5em;
        margin-block-end: 0.5em;
        line-height: 20px;
        font-size: 14px;
    }

    & a {
        color: ${(props) => props.theme.colors.prime1};

        &:visited {
            color: ${(props) => props.theme.colors.prime1};
        }
    }

    & h1 {
        font-size: 18px;
        margin-block-start: 1em;
        margin-block-end: 0.5em;
        line-height: 22px;

        &:first-child {
            margin-top: 5px;
        }
    }

    & h2 {
        margin-block-start: 1em;
        margin-block-end: 0.5em;
        line-height: 22px;
        font-size: 16px;

        &:first-child {
            margin-top: 5px;
        }
    }

    & h3 {
        font-size: 16px;
        margin-block-start: 1em;
        margin-block-end: 0.5em;
        line-height: 22px;

        &:first-child {
            margin-top: 5px;
        }
    }

    & h4 {
        margin-block-start: 1em;
        margin-block-end: 0.5em;

        &:first-child {
            margin-top: 5px;
        }
    }

    & h5 {
        margin-block-start: 1em;
        margin-block-end: 0.5em;

        &:first-child {
            margin-top: 5px;
        }
    }

    & blockquote {
        border-left: #5cd9a6 3px solid;
        margin-inline-start: 10px;
        padding-left: 10px;
    }

    & code {
        padding: 2px 3px 1px;
        border: 1px solid #1d1c1d21;
        border-radius: 3px;
        background-color: #1d1c1d0a;
        color: #e01e5a;
        font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace !important;
    }

    & pre {
        width: fill-available;
        border: 1px solid #1d1c1d21;
        border-radius: 3px;
        background-color: #1d1c1d0a;
        padding: 10px;
        font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace !important;

        & code {
            width: 100%;
            padding: unset;
            border: none;
            border-radius: unset;
            background-color: unset;
            color: inherit;
        }
    }

    & > * {
        & > * {
            &:first-child {
                margin-block-start: 0em !important;
            }
        }
    }

    & > * {
        & > * {
            &:last-child {
                margin-block-end: 0em !important;
            }
        }
    }
`
