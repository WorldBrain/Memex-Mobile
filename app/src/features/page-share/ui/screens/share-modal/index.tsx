import React from 'react'
import { Text, Linking } from 'react-native'

import { supportEmail } from '../../../../../../app.json'
import { StatefulUIElement } from 'src/ui/types'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import Logic, { Props, State, Event } from './logic'
import { MetaType, MetaTypeShape } from 'src/features/meta-picker/types'
import AddCollection from '../../components/add-collections-segment'
import ShareModal from '../../components/share-modal'
import ActionBar from '../../components/action-bar-segment'
import NoteInput from '../../components/note-input-segment'
import AddTags from '../../components/add-tags-segment'
import UnsupportedApp from '../../components/unsupported-app'
import ReloadBtn from '../../components/reload-btn'
import SavingUpdates from '../../components/saving-updates'
import SyncError from '../../components/sync-error'
import styles from './styles'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'
import LoadingIndicator from 'src/ui/components/loading-balls'
import EStyleSheet from 'react-native-extended-stylesheet'

export default class ShareModalScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    private metaPicker!: MetaPicker

    constructor(props: Props) {
        super(props, new Logic(props))
    }

    private static arraysAreSame = (a: any[] = [], b: any[] = []): boolean => {
        for (const el of a) {
            if (!b.includes(el)) {
                return false
            }
        }

        return true
    }

    private get isInputDirty(): boolean {
        const { initValues } = this.logic as Logic

        return (
            this.state.noteText.length > 0 ||
            this.state.isStarred !== initValues.isStarred ||
            !ShareModalScreen.arraysAreSame(
                this.state.collectionsToAdd,
                initValues.collectionsToAdd,
            ) ||
            !ShareModalScreen.arraysAreSame(
                this.state.tagsToAdd,
                initValues.tagsToAdd,
            )
        )
    }

    private calcInitEntries = (): string[] =>
        this.state.metaViewShown === 'collections'
            ? this.state.collectionsToAdd
            : this.state.tagsToAdd

    private handleMetaViewTypeSwitch = (type?: MetaType) => (e: any) => {
        this.processEvent('setMetaViewType', { type })
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

    private handleMetaPickerEntryPress = async (entry: MetaTypeShape) => {
        await this.processEvent('metaPickerEntryPress', { entry })
    }

    private handleReloadPress = async () => {
        await (this.logic as Logic).syncRunning
        this.metaPicker.processEvent('reload', {
            selected: this.calcInitEntries(),
        })
    }

    private handleNoteTextChange = (value: string) => {
        this.processEvent('setNoteText', { value })
    }

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
        if (this.state.metaViewShown) {
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
                    initSelectedEntries={this.calcInitEntries()}
                    type={this.state.metaViewShown}
                    url={this.state.pageUrl}
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
                    onLeftBtnPress={this.handleMetaViewTypeSwitch(undefined)}
                    onRightBtnPress={
                        this.state.metaViewShown
                            ? this.handleMetaViewTypeSwitch(undefined)
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
                {/* <AddTags
                    onPress={this.handleMetaViewTypeSwitch('tags')}
                    count={this.state.tagsToAdd.length}
                    loading={this.state.tagsState === 'running'}
                /> */}
                {this.state.collectionsState === 'done' &&
                    this.state.collectionsToAdd.length > 0 && (
                        <SpaceBar>
                            <SpacesContainer
                                horizontal={true}
                                contentContainerStyle={
                                    styledScrollView.Container
                                }
                            >
                                {this.state.collectionsToAdd.map((elements) => (
                                    <SpacePills>
                                        <SpacePillsText>
                                            {elements}
                                        </SpacePillsText>
                                    </SpacePills>
                                ))}
                            </SpacesContainer>
                        </SpaceBar>
                    )}
                <ActionBarContainer
                    leftBtnText={
                        <Icon
                            icon={icons.TagEmpty}
                            heightAndWidth={'20px'}
                            strokeWidth={'3px'}
                        />
                    }
                    onLeftBtnPress={this.handleMetaViewTypeSwitch('tags')}
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
                    <AddSpacesContainer
                        onPress={this.handleMetaViewTypeSwitch('collections')}
                    >
                        {this.state.collectionsState === 'running' ? (
                            <LoadingIndicatorBox>
                                <LoadingIndicator size={15} />
                            </LoadingIndicatorBox>
                        ) : (
                            <>
                                {this.state.collectionsToAdd.length === 0 ? (
                                    <>
                                        <Icon
                                            icon={icons.Plus}
                                            heightAndWidth={'14px'}
                                            color={'purple'}
                                            strokeWidth={'2px'}
                                        />
                                    </>
                                ) : (
                                    <SpacesCounterPill>
                                        <SpacesCounterText>
                                            {this.state.collectionsToAdd.length}
                                        </SpacesCounterText>
                                    </SpacesCounterPill>
                                )}
                            </>
                        )}
                        <AddSpacesText>Add page to Spaces</AddSpacesText>
                    </AddSpacesContainer>
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

        return this.state.metaViewShown
            ? this.renderMetaPicker()
            : this.renderInputs()
    }

    render() {
        return (
            <ShareModal
                isModalShown={this.state.isModalShown}
                onClosed={this.props.services.shareExt.close}
                stretched={!!this.state.metaViewShown}
            >
                {this.renderModalContent()}
            </ShareModal>
        )
    }
}

const styledScrollView = EStyleSheet.create({
    Container: {
        justifyContent: 'flex-start',
        height: 40,
        alignItems: 'center',
    },
})

const SpaceBar = styled.View`
    height: 40px;
`

const SpacesContainer = styled.ScrollView`
    border-style: solid;
    border-top-width: 1px;
    border-color: ${(props) => props.theme.colors.lightgrey};
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 0 15px;
`

const SpacePills = styled.View`
    background: ${(props) => props.theme.colors.purple}
    padding: 2px 8px;
    margin-right: 3px;
    border-radius: 4px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

const SpacePillsText = styled.Text`
    font-size: 14px;
    font-weight: 500;
    color: white;
`

const ActionBarContainer = styled(ActionBar)`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background: red;
`

const LoadingIndicatorBox = styled.View`
    margin-right: 5px;
`

const SpacesCounterPill = styled.View`
    padding: 1px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: ${(props) => props.theme.colors.purple}
    border-radius: 50px;
    margin-right: 5px;
`

const SpacesCounterText = styled.Text`
    color: white;
    font-weight: 600;
    text-align: center;
    font-size: 12px;
`

const AddSpacesContainer = styled.TouchableOpacity`
    border-width: 2px;
    border-style: dotted;
    border-color: ${(props) => props.theme.colors.lightgrey}
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    text-align-vertical: center;
    height: 30px;
    padding: 2px 8px;
`

const AddSpacesText = styled.Text`
    color: ${(props) => props.theme.colors.purple};
    font-size: 12px;
    display: flex;
    align-items flex-end;
    flex-direction: row;
    justify-content: flex-end;
    text-align-vertical: bottom;
    width: 120px;
    text-align: right;
`

const TitleText = styled.Text`
    color: ${(props) => props.theme.colors.darkerText};
    font-size: 14px;
    font-weight: 700;
`
