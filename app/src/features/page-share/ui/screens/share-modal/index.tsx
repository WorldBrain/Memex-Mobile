import React from 'react'
import { Text, Linking } from 'react-native'

import { supportEmail } from '../../../../../../app.json'
import { StatefulUIElement } from 'src/ui/types'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import Logic, { Props, State, Event } from './logic'
import type { SpacePickerEntry } from 'src/features/meta-picker/types'
import ShareModal from '../../components/share-modal'
import ActionBar from '../../components/action-bar-segment'
import NoteInput from '../../components/note-input-segment'
import UnsupportedApp from '../../components/unsupported-app'
import ReloadBtn from '../../components/reload-btn'
import SavingUpdates from '../../components/saving-updates'
import SyncError from '../../components/sync-error'
import styles from './styles'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'
import LoadingIndicator from 'src/ui/components/loading-balls'
import { areArraysTheSame } from 'src/utils/are-arrays-the-same'
import AddToSpacesBtn from 'src/ui/components/add-to-spaces-btn'
import AnnotationPrivacyBtn from 'src/ui/components/annot-privacy-btn'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'

export default class ShareModalScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    private metaPicker!: MetaPicker

    constructor(props: Props) {
        super(props, new Logic(props))
    }

    private get isInputDirty(): boolean {
        const { initValues } = this.logic as Logic

        return (
            this.state.noteText.trim().length > 0 ||
            this.state.isStarred !== initValues.isStarred ||
            !areArraysTheSame(this.state.spacesToAdd, initValues.spacesToAdd)
        )
    }

    private setSpacePickerShown = (isShown: boolean) => (e: any) => {
        this.processEvent('setSpacePickerShown', { isShown })
    }

    private handleModalClose = () => {
        this.processEvent('setModalVisible', { shown: false })
        // For whatever reason, calling this seems to result in a crash. Though it still closes as expected without calling it...
        // this.props.services.shareExt.close()
    }

    private handleUndo = () => {
        return this.processEvent('undoPageSave', null)
    }

    private handleSave = async () => {
        await this.processEvent('save', { isInputDirty: this.isInputDirty })
        // For whatever reason, calling this seems to result in a crash. Though it still closes as expected without calling it...
        // this.props.services.shareExt.close()
    }

    private handleStarPress = () => {
        this.processEvent('togglePageStar', null)
    }

    private handleMetaPickerEntryPress = async (entry: SpacePickerEntry) => {
        await this.processEvent('metaPickerEntryPress', { entry })
    }

    private handleReloadPress = async () => {
        await (this.logic as Logic).syncRunning
        await this.metaPicker.processEvent('reload', null)
    }

    private handleNoteTextChange = (value: string) => {
        this.processEvent('setNoteText', { value })
    }

    private handlePrivacyLevelSet = (value: AnnotationPrivacyLevels) =>
        this.processEvent('setPrivacyLevel', { value })

    private handleSyncErrorReport = () => {
        const subject = `SYNC ERROR: Share modal`
        const body = `
        I encountered an error in the process of auto-sync when using the Memex Go share modal.

        Below is the error message:

        ${this.state.errorMessage}
        `

        return Linking.openURL(
            `mailto:${supportEmail}?subject=${subject}&body=${body}`,
        )
    }

    private setMetaPickerRef = (metaPicker: MetaPicker) => {
        this.metaPicker = metaPicker
    }

    private renderTitle() {
        if (this.state.isSpacePickerShown) {
            return (
                <>
                    <TitleText>{this.state.statusText}</TitleText>
                    <ReloadBtn onPress={this.handleReloadPress} />
                </>
            )
        }

        if (this.state.loadState === 'running') {
            return null
        }

        if (this.isInputDirty) {
            return null
        }

        return <Text style={styles.titleText}>Saved!</Text>
    }

    private renderMetaPicker() {
        return (
            <>
                <MetaPicker
                    onEntryPress={this.handleMetaPickerEntryPress}
                    initSelectedEntries={this.state.spacesToAdd}
                    ref={this.setMetaPickerRef}
                    {...this.props}
                />
                <ActionBar
                    leftBtnText={
                        <Icon
                            icon={icons.BackArrow}
                            heightAndWidth={'24px'}
                            strokeWidth={'8px'}
                        />
                    }
                    onLeftBtnPress={this.setSpacePickerShown(false)}
                    onRightBtnPress={
                        this.state.isSpacePickerShown
                            ? this.setSpacePickerShown(false)
                            : this.handleSave
                    }
                    rightBtnText={
                        this.isInputDirty ? (
                            <Icon
                                icon={icons.CheckMark}
                                heightAndWidth={'28px'}
                                color={'purple'}
                                strokeWidth={'3px'}
                            />
                        ) : (
                            <Icon
                                icon={icons.CheckMark}
                                heightAndWidth={'24px'}
                                strokeWidth={'2px'}
                            />
                        )
                    }
                >
                    {this.renderTitle()}
                </ActionBar>
            </>
        )
    }

    private renderInputs() {
        return (
            <>
                <NoteInput
                    onChange={this.handleNoteTextChange}
                    value={this.state.noteText}
                />
                {/* {this.state.spacesState === 'done' &&
                    this.state.spacesToAdd.length > 0 && (
                        <SpaceBar>
                            <SpacesContainer
                                horizontal={true}
                                contentContainerStyle={
                                    styledScrollView.Container
                                }
                            >
                                {this.state.spacesToAdd
                                    .map((elements) => (
                                        <SpacePills>
                                            <SpacePillsText>
                                                {elements}
                                            </SpacePillsText>
                                        </SpacePills>
                                    ))}
                            </SpacesContainer>
                        </SpaceBar>
                    )} */}
                <ActionBarContainer
                    onRightBtnPress={this.handleSave}
                    rightBtnText={
                        this.isInputDirty ? (
                            <Icon
                                icon={icons.CheckMark}
                                heightAndWidth={'28px'}
                                color={'purple'}
                                strokeWidth={'3px'}
                            />
                        ) : (
                            <Icon
                                icon={icons.CheckMark}
                                heightAndWidth={'24px'}
                                strokeWidth={'2px'}
                            />
                        )
                    }
                >
                    {this.state.spacesState === 'running' ? (
                        <LoadingIndicatorBox>
                            <LoadingIndicator size={15} />
                        </LoadingIndicatorBox>
                    ) : (
                        <>
                            {this.state.noteText ? (
                                <AnnotationPrivacyBtn
                                    actionSheetService={
                                        this.props.services.actionSheet
                                    }
                                    level={this.state.privacyLevel}
                                    onPrivacyLevelChoice={
                                        this.handlePrivacyLevelSet
                                    }
                                />
                            ) : (
                                <></>
                            )}
                            <AddToSpacesBtn
                                mainText={`Add ${
                                    this.state.noteText.trim().length
                                        ? 'Note'
                                        : 'Page'
                                } to Spaces`}
                                onPress={this.setSpacePickerShown(true)}
                                spaceCount={this.state.spacesToAdd.length}
                            />
                        </>
                    )}
                </ActionBarContainer>
            </>
        )
    }

    private renderUnsupportedApp() {
        return (
            <>
                <ActionBar onLeftBtnPress={this.handleModalClose} />
                <UnsupportedApp />
            </>
        )
    }

    private renderSyncError() {
        return (
            <>
                <ActionBar
                    rightBtnText="Close"
                    onRightBtnPress={() =>
                        this.processEvent('clearSyncError', null)
                    }
                />
                <SyncError
                    errorMessage={this.state.errorMessage!}
                    onReportPress={this.handleSyncErrorReport}
                    isRetrying={this.state.syncRetryState === 'running'}
                    onRetryPress={() => this.processEvent('retrySync', null)}
                />
            </>
        )
    }

    private renderModalContent() {
        if (this.state.showSavingPage) {
            return <SavingUpdates />
        }

        if (this.state.errorMessage?.length) {
            return this.renderSyncError()
        }

        if (this.state.isUnsupportedApplication) {
            return this.renderUnsupportedApp()
        }

        return this.state.isSpacePickerShown
            ? this.renderMetaPicker()
            : this.renderInputs()
    }

    render() {
        return (
            <ShareModal
                isModalShown={this.state.isModalShown}
                onClosed={this.props.services.shareExt.close}
                stretched={!!this.state.isSpacePickerShown}
            >
                {this.renderModalContent()}
            </ShareModal>
        )
    }
}

const ActionBarContainer = styled(ActionBar)`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: white;
`

const LoadingIndicatorBox = styled.View`
    margin-right: 5px;
`

const TitleText = styled.Text`
    color: ${(props) => props.theme.colors.darkerText};
    font-size: 14px;
    font-weight: 700;
`
