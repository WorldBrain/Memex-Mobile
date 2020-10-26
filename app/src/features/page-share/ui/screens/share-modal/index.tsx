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
import StarPage from '../../components/star-page-segment'
import AddTags from '../../components/add-tags-segment'
import UnsupportedApp from '../../components/unsupported-app'
import ReloadBtn from '../../components/reload-btn'
import SavingUpdates from '../../components/saving-updates'
import SyncError from '../../components/sync-error'
import styles from './styles'

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
        await this.processEvent('savePageTitle', null)

        if (this.isInputDirty) {
            this.processEvent('save', null)
        } else {
            this.handleModalClose()
        }
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
                    <Text style={styles.titleText}>
                        {this.state.statusText}
                    </Text>
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
                <ActionBar
                    leftBtnText="Back"
                    onLeftBtnPress={this.handleMetaViewTypeSwitch(undefined)}
                    onRightBtnPress={this.handleSave}
                    rightBtnText={this.isInputDirty ? 'Save' : 'Close'}
                >
                    {this.renderTitle()}
                </ActionBar>
                <MetaPicker
                    onEntryPress={this.handleMetaPickerEntryPress}
                    initSelectedEntries={this.calcInitEntries()}
                    type={this.state.metaViewShown}
                    url={this.state.pageUrl}
                    ref={this.setMetaPickerRef}
                    {...this.props}
                />
            </>
        )
    }

    private renderInputs() {
        return (
            <>
                <ActionBar
                    showReaderBanner
                    leftBtnText="Undo"
                    onLeftBtnPress={this.handleUndo}
                    onRightBtnPress={this.handleSave}
                    rightBtnText={this.isInputDirty ? 'Save' : 'Close'}
                >
                    {this.renderTitle()}
                </ActionBar>
                <NoteInput
                    onChange={this.handleNoteTextChange}
                    value={this.state.noteText}
                />
                <StarPage
                    isStarred={this.state.isStarred}
                    onPress={this.handleStarPress}
                    loading={this.state.bookmarkState !== 'done'}
                />
                <AddCollection
                    onPress={this.handleMetaViewTypeSwitch('collections')}
                    count={this.state.collectionsToAdd.length}
                    loading={this.state.collectionsState !== 'done'}
                />
                <AddTags
                    onPress={this.handleMetaViewTypeSwitch('tags')}
                    count={this.state.tagsToAdd.length}
                    loading={this.state.tagsState !== 'done'}
                />
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
