import React from 'react'
import {
    Text,
    TouchableOpacity,
    LayoutChangeEvent,
    Dimensions,
    Keyboard,
    EmitterSubscription,
    Platform,
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
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import { areArrayContentsEqual } from 'src/utils/are-arrays-the-same'
import AnnotationPrivacyBtn from 'src/ui/components/annot-privacy-btn'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import { RenderHTML } from 'src/ui/utils/RenderHTML'

export default class extends StatefulUIElement<Props, State, Event> {
    private keyboardShowListener: EmitterSubscription
    private keyboardHideListener: EmitterSubscription

    constructor(props: Props) {
        super(props, new Logic(props))

        this.keyboardShowListener = Keyboard.addListener(
            'keyboardDidShow',
            (event) =>
                this.processEvent('keyBoardShow', {
                    keyBoardHeight: event.endCoordinates.height,
                }),
        )
        this.keyboardHideListener = Keyboard.addListener(
            'keyboardDidHide',
            (event) => this.processEvent('keyBoardHide', null),
        )
    }

    async componentWillUnmount() {
        this.keyboardShowListener.remove()
        this.keyboardHideListener.remove()
        await super.componentWillUnmount()
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
                <HTMLRenderBox>
                    {RenderHTML(this.state.highlightText)}
                </HTMLRenderBox>
            </AnnotationContainer>
        )
    }

    private get editorHeight(): number {
        const offset =
            Platform.OS === 'android' && this.state.keyBoardHeight > 0
                ? 200
                : 120
        return (
            Dimensions.get('screen').height - this.state.keyBoardHeight - offset
        )
    }

    render() {
        return (
            <Container>
                <Navigation
                    leftIcon={icons.BackArrow}
                    leftBtnPress={this.handleBackBtnPress}
                    leftIconSize={'24px'}
                    leftIconStrokeWidth={'0px'}
                    rightIcon={this.showSaveBtn && icons.CheckMark}
                    rightBtnPress={
                        this.showSaveBtn ? this.handleSaveBtnPress : undefined
                    }
                    rightIconColor={'prime1'}
                    rightIconSize={'24px'}
                    rightIconStrokeWidth={'3px'}
                    titleText={this.titleText}
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
                            {this.state.highlightText &&
                            this.state.highlightText?.length > 0
                                ? this.renderHighlightText()
                                : null}
                            <NoteInputEditorBox
                                height={this.editorHeight + 'px'}
                            >
                                <NoteInputEditor
                                    onChange={this.handleInputChange}
                                    disabled={this.disableInputs}
                                    className={styles.noteInput}
                                    value={this.state.noteText}
                                    initNote={this.state.initNoteText}
                                />
                                <TopBar>
                                    <SpaceBar>
                                        <AddToSpacesBtn
                                            mini={
                                                this.state.spacesToAdd.length >
                                                0
                                            }
                                            onPress={() =>
                                                this.processEvent(
                                                    'setSpacePickerShown',
                                                    { isShown: true },
                                                )
                                            }
                                            spaceCount={
                                                this.state.spacesToAdd.length
                                            }
                                        />
                                    </SpaceBar>
                                    <RightSide>
                                        {/* <AnnotationPrivacyBtn
                                            actionSheetService={
                                                this.props.services.actionSheet
                                            }
                                            level={this.state.privacyLevel}
                                            hasSharedLists={this.state.spacesToAdd.some(
                                                (space) =>
                                                    space.remoteId != null,
                                            )}
                                            onPrivacyLevelChoice={(value) =>
                                                this.processEvent(
                                                    'setPrivacyLevel',
                                                    {
                                                        value,
                                                    },
                                                )
                                            }
                                        /> */}
                                        <IconContainer
                                            onPress={
                                                this.showSaveBtn
                                                    ? this.handleSaveBtnPress
                                                    : () => {}
                                            }
                                        >
                                            <Icon
                                                icon={icons.CheckMark}
                                                strokeWidth="0"
                                                heightAndWidth="22px"
                                                color={
                                                    this.showSaveBtn
                                                        ? 'prime1'
                                                        : 'greyScale4'
                                                }
                                                fill
                                            />
                                        </IconContainer>
                                    </RightSide>
                                </TopBar>
                            </NoteInputEditorBox>
                        </>
                    )}
                </ScrollContainer>
            </Container>
        )
    }
}

const IconContainer = styled.TouchableOpacity`
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const RightSide = styled.View`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
`

const HTMLRenderBox = styled.ScrollView`
    margin: -10px 0px;
    width: 50%;
    flex: 1;
`

const Container = styled.SafeAreaView`
    background: ${(props) => props.theme.colors.black};
`

const NoteInputEditorBox = styled.View<{ height: string }>`
    border-style: solid;
    border-width: 1px;
    border-radius: 8px;
    border-color: ${(props) => props.theme.colors.greyScale3};
    height: ${(props) => props.height};
    max-height: 35%;
    width: 620px;
    overflow: hidden;
    max-width: 100%;
    background: ${(props) => props.theme.colors.greyScale1};
`

const NoteInputEditor = styled(NoteInput)`
    background: ${(props) => props.theme.colors.greyScale1};
`

const TopBar = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 40px;
    background: ${(props) => props.theme.colors.greyScale1};
    border-style: solid;
    border-top-width: 1px;
    border-top-color: ${(props) => props.theme.colors.greyScale2};
    padding: 0 10px 0 5px;
`

const SpaceBar = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    overflow: scroll;
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
    margin: 10px 0px 10px 0px;
    padding: 15px;
    border-radius: 8px;
    max-width: 620px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    background: ${(props) => props.theme.colors.greyScale1};
    max-height: 100px;
`

const VerticalBar = styled.View`
    background: ${(props) => props.theme.colors.prime1};
    border-radius: 3px;
    min-width: 6px;
    max-width: 6px;
    flex: 1;
    height: auto;
    display: flex;
    margin-right: 10px;
`

const EditorStyless = (props: any) => {
    return `
    outline: none;
    width: fill-available;
    hyphens: none;
    color: ${props.theme.colors.white};
    line-height: 20px;

    & table {
        border-radius: 8px;
        border: 1px solid ${props.theme.colors.greyScale2};
        width: fit-available;
        border-spacing: 0px;
        max-width: 100%;
        width: fill-available;
    }
    & th {
        border-bottom: 1px solid ${props.theme.colors.greyScale2};
        vertical-align: middle;
        border-right: 1px solid ${props.theme.colors.greyScale2};
        padding: 8px 10px;
        text-align: left;
        vertical-align: middle;
        max-width: 100px;
        width: fill-available;

        &:last-child {
            border-bottom: none;
        }
    }

    & tr {
        width: fill-available;
    }

    & tr:last-child {
        & th {
            border-bottom: none;
        }
        & td {
            border-bottom: none;
        }
    }

    & td {
        border-right: 1px solid ${props.theme.colors.greyScale2};
        border-bottom: 1px solid ${props.theme.colors.greyScale2};
        padding: 8px 10px;
        text-align: left;
        vertical-align: middle;

        &:last-child {
            border-right: none;
        }
    }


    .WikiLink {
        text-decoration: none;
    }

    a {text-decoration: none};

    & * {
        line-height: 20px;
        white-space: pre-wrap;
        word-break: break-word;
        hyphens: none;
        letter-spacing: 0.8px;
        color: ${props.theme.colors.white};
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
        color: ${props.theme.colors.prime1};

        &:visited {
            color: ${props.theme.colors.prime1};
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
}
