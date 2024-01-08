import React from 'react'
import { Text, Linking, Keyboard, Dimensions } from 'react-native'

import { supportEmail } from '../../../../../../app.json'
import { StatefulUIElement } from 'src/ui/types'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import Logic, { Dependencies } from './logic'
import type { SpacePickerEntry } from 'src/features/meta-picker/types'
import ShareModal from '../../components/share-modal'
import ActionBar from '../../components/action-bar-segment'
import NoteInput from '../../components/note-input-segment'
import UnsupportedApp from '../../components/unsupported-app'
import SavingUpdates from '../../components/saving-updates'
import SyncError from '../../components/sync-error'
import styles from './styles'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'
import AddToSpacesBtn from 'src/ui/components/add-to-spaces-btn'
import AnnotationPrivacyBtn from 'src/ui/components/annot-privacy-btn'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import FeedActivityIndicator from 'src/features/activity-indicator'
import { isInputDirty } from './util'
import type { State, Event } from './types'
import Reader from 'src/features/reader/ui/screens/reader'
import { isUrlYTVideo } from '@worldbrain/memex-common/lib/utils/youtube-url'
import { PrimaryAction } from 'src/ui/utils/ActionButtons'

export interface Props extends Omit<Dependencies, 'keyboardAPI'> {}

export default class ShareModalScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    private metaPicker!: MetaPicker

    constructor(props: Props) {
        super(
            props,
            new Logic({
                ...props,
                keyboardAPI: Keyboard,
            }),
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
        await this.processEvent('save', {})
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
                <ReloadButton onPress={this.handleReloadPress}>
                    <Icon
                        icon={icons.Reload}
                        strokeWidth="0"
                        heightAndWidth="15px"
                        color="greyScale4"
                        fill
                    />
                    <TitleText>Refresh</TitleText>
                </ReloadButton>
            )
        }

        if (this.state.loadState === 'running') {
            return null
        }

        if (isInputDirty(this.state)) {
            return null
        }

        return <Text style={styles.titleText}>Saved!</Text>
    }

    private renderMetaPicker() {
        return (
            <ShareModalContainer>
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
                            strokeWidth={'0px'}
                            fill
                        />
                    }
                    onLeftBtnPress={this.setSpacePickerShown(false)}
                    onRightBtnPress={
                        this.state.isSpacePickerShown
                            ? this.setSpacePickerShown(false)
                            : this.handleSave
                    }
                    rightBtnText={
                        isInputDirty(this.state) ? (
                            <Icon
                                icon={icons.CheckMark}
                                heightAndWidth={'28px'}
                                color={'prime1'}
                                strokeWidth={'0px'}
                                fill
                            />
                        ) : (
                            <Icon
                                icon={icons.CheckMark}
                                heightAndWidth={'24px'}
                                strokeWidth={'0px'}
                                fill
                            />
                        )
                    }
                >
                    {this.renderTitle()}
                </ActionBar>
            </ShareModalContainer>
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
                        isInputDirty(this.state) ? (
                            <Icon
                                icon={icons.CheckMark}
                                heightAndWidth={'24px'}
                                color={'prime1'}
                                strokeWidth={'0px'}
                                fill
                            />
                        ) : (
                            <Icon
                                icon={icons.CheckMark}
                                heightAndWidth={'24px'}
                                strokeWidth={'0px'}
                                fill
                            />
                        )
                    }
                    rightArea={
                        this.state.noteText ? (
                            <AnnotationPrivacyBtn
                                actionSheetService={
                                    this.props.services.actionSheet
                                }
                                level={this.state.privacyLevel}
                                onPrivacyLevelChoice={
                                    this.handlePrivacyLevelSet
                                }
                            />
                        ) : undefined
                    }
                    leftArea={
                        <AddToSpacesBtn
                            mainText={`${
                                this.state.noteText.trim().length
                                    ? 'Note'
                                    : 'Page'
                            } to Spaces`}
                            onPress={this.setSpacePickerShown(true)}
                            spaceCount={this.state.spacesToAdd.length}
                        />
                    }
                    renderIndicator={() => (
                        <FeedActivityIndicator
                            services={this.props.services}
                            customFeedOpener={() =>
                                this.processEvent('save', { thenGoToApp: true })
                            }
                        />
                    )}
                >
                    {/* {this.state.spacesState === 'running' ? (
                        <LoadingIndicatorBox>
                            <LoadingIndicator size={15} />
                        </LoadingIndicatorBox>
                    ) : (
                        <></>
                    )} */}
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

    private renderWebView() {
        if (!this.state.pageUrl) {
            return null // or return <LoadingComponent /> if you have one
        }

        if (isUrlYTVideo(this.state.pageUrl)) {
            return (
                <YoutubeRedirectNotice>
                    <Icon
                        icon={icons.CheckMark}
                        heightAndWidth="24px"
                        strokeWidth="0"
                        fill
                        color="prime1"
                        hoverOff
                    />
                    <YoutubeRedirectNoticeText>
                        Video Saved!
                    </YoutubeRedirectNoticeText>
                    <YoutubeRedirectNoticeSubText>
                        Go to the app to annotate & summarize YouTube videos.
                        Improvement coming soon!
                    </YoutubeRedirectNoticeSubText>
                    <PrimaryAction
                        onPress={this.handleModalClose}
                        label="Go back"
                        type="primary"
                        size="small"
                    />
                </YoutubeRedirectNotice>
            )
        }

        return (
            <Reader
                {...this.props}
                pageUrl={this.state.pageUrl}
                hideNavigation
                deviceInfo={this.state.deviceInfo ?? null}
                closeModal={this.handleModalClose}
                location="shareExt"
                keyboardHeight={this.state.keyboardHeight}
            />
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
            : this.renderWebView()
    }

    render() {
        let editorHeight = Dimensions.get('screen').height
        return (
            <ShareModal
                isModalShown={this.state.isModalShown}
                onClosed={this.props.services.shareExt.close}
                stretched={!!this.state.isSpacePickerShown}
                height={editorHeight}
                deviceInfo={this.state.deviceInfo ?? null}
            >
                {this.state.pageSaveFinished && (
                    <PageSavedPill>
                        <Icon
                            icon={icons.CheckMark}
                            heightAndWidth="15px"
                            strokeWidth="0"
                            fill
                            color="prime1"
                            hoverOff
                        />
                        <PageSavedText>Page saved!</PageSavedText>
                    </PageSavedPill>
                )}
                {this.renderModalContent()}
            </ShareModal>
        )
    }
}

const PageSavedPill = styled.View`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 30px;
    background: ${(props) => props.theme.colors.greyScale1};
    border: 1px solid ${(props) => props.theme.colors.greyScale3};
    border-radius: 15px;
    position: absolute;
    top: 10px;
    left: 50%;
    margin-left: -60px;
    z-index: 1000;
`

const PageSavedText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale7};
    font-size: 14px;
    font-weight: 500;
    margin-left: 5px;
    font-family: 'Satoshi';
`

const ShareModalContainer = styled.View`
    background: ${(props) => props.theme.colors.greyScale1};
    display: flex;
    flex-direction: column;
    height: 100%;
`

const ActionBarContainer = styled(ActionBar)`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: ${(props) => props.theme.colors.greyScale1};
`

const LoadingIndicatorBox = styled.View`
    margin-right: 5px;
`

const TitleText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale4};
    font-size: 14px;
    font-weight: 300;
    margin-left: 5px;
    font-family: 'Satoshi';
`

const ReloadButton = styled.TouchableOpacity`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 40px;
`

const YoutubeRedirectNotice = styled.View`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 20px;
    height: 100%;
`

const YoutubeRedirectNoticeText = styled.Text`
    font-size: 16px;
    font-weight: 500;
    color: ${(props) => props.theme.colors.greyScale7};
    margin-top: 10px;
    margin-bottom: 5px;
    font-family: 'Satoshi';
    text-align: center;
`

const YoutubeRedirectNoticeSubText = styled.Text`
    font-size: 14px;
    font-weight: 500;
    color: ${(props) => props.theme.colors.greyScale6};
    margin-top: 10px;
    margin-bottom: 30px;
    font-family: 'Satoshi';
    text-align: center;
`
