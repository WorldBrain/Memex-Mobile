import React from 'react'
import {
    Text,
    TouchableOpacity,
    LayoutChangeEvent,
    Dimensions,
    useWindowDimensions,
    Keyboard,
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
import {
    CORE_THEME,
    THEME,
} from '@worldbrain/memex-common/lib/common-ui/styles/theme'

export default class extends StatefulUIElement<Props, State, Event> {
    constructor(props: Props) {
        super(props, new Logic(props))
    }

    keyboardShowListener
    keyboardHideListener

    componentDidMount(): void {
        this.keyboardShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.handleKeyboardShow,
        )
        this.keyboardHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this.handleKeyboardHide,
        )
    }

    componentWillUnmount(): void {
        this.keyboardShowListener.remove()
        this.keyboardHideListener.remove()
    }

    handleKeyboardShow = (event: KeyboardEvent) => {
        this.processEvent('keyBoardShow', event.endCoordinates.height)
    }
    handleKeyboardHide = () => {
        this.processEvent('keyBoardHide', null)
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
                    <RenderHtml
                        contentWidth={Dimensions.get('screen').width - 60}
                        source={{
                            html: `<div>` + this.state.highlightText + '</div>',
                        }}
                        tagsStyles={testStyles}
                        baseStyle={{
                            marginTop: '-10px',
                            marginBottom: '-10px',
                            lineHeight: 20,
                            fontWeight: '300',
                        }}
                    />
                </HTMLRenderBox>
            </AnnotationContainer>
        )
    }

    render() {
        let editorHeight =
            Dimensions.get('screen').height - this.state.keyBoardHeight - 220

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
                            {this.renderHighlightText()}
                            <NoteInputEditorBox height={editorHeight + 'px'}>
                                <NoteInputEditor
                                    onChange={this.handleInputChange}
                                    disabled={this.disableInputs}
                                    className={styles.noteInput}
                                    value={this.state.noteText}
                                />
                            </NoteInputEditorBox>
                            {/* <TopBar>
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
                            </TopBar> */}
                        </>
                    )}
                </ScrollContainer>
            </Container>
        )
    }
}

const HTMLRenderBox = styled.View`
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
    max-height: 400px;
    margin: 0 10px;
    width: 620px;
    max-width: 100%;
`

const NoteInputEditor = styled(NoteInput)`
    background: ${(props) => props.theme.colors.greyScale1};
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

const testStyles = {
    p: {
        color: `${CORE_THEME().colors.white}`,
    },
    a: {
        color: `${CORE_THEME().colors.prime1}`,
        textDecorationLine: 'none',
    },
    h1: {
        fontSize: '18px',
    },
    h2: {
        fontSize: '16px',
    },
    h3: {
        fontSize: '14px',
    },
    h4: {
        fontSize: '12px',
    },
    h5: {
        fontSize: '12px',
    },
    table: {
        borderRadius: '8px',
        borderColor: `${CORE_THEME().colors.greyScale2}`,
        borderWidth: '1px',
        width: '100%',
    },
    th: {
        padding: '8px 10px',
        color: `${CORE_THEME().colors.white}`,
        borderBottomColor: `${CORE_THEME().colors.greyScale2}`,
        borderBottomWidth: '1px',
    },
    td: {
        padding: '8px 10px',
        color: `${CORE_THEME().colors.white}`,
        borderBottomColor: `${CORE_THEME().colors.greyScale2}`,
        borderBottomWidth: '1px',
        borderLeftColor: `${CORE_THEME().colors.greyScale2}`,
        borderLeftWidth: '1px',
    },
}

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
