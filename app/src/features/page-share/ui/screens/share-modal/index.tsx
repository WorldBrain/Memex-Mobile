import React from 'react'

import { NavigationScreen } from 'src/ui/types'
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

export default class ShareModalScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private handleMetaViewTypeSwitch = (type?: MetaType) => (e: any) => {
        this.processEvent('setMetaViewType', { type })
    }

    private handleModalClose = () => {
        this.processEvent('setModalVisible', { shown: false })
        // For whatever reason, calling this seems to result in a crash. Though it still closes as expected without calling it...
        // this.props.services.shareExt.close()
    }

    private handleSave = () => {
        this.processEvent('save', {})
        // For whatever reason, calling this seems to result in a crash. Though it still closes as expected without calling it...
        // this.props.services.shareExt.close()
    }

    private handleStarPress = () => {
        this.processEvent('togglePageStar', {})
    }

    private handleMetaPickerEntryPress = async (entry: MetaTypeShape) => {
        await this.processEvent('metaPickerEntryPress', { entry })
    }

    private handleNoteTextChange = (value: string) => {
        this.processEvent('setNoteText', { value })
    }

    private renderMetaPicker() {
        const initEntries =
            this.state.metaViewShown === 'collections'
                ? this.state.collectionsToAdd
                : this.state.tagsToAdd

        return (
            <>
                <ActionBar
                    onCancelPress={this.handleMetaViewTypeSwitch(undefined)}
                />
                <MetaPicker
                    isSyncLoading={this.state.syncState === 'running'}
                    onEntryPress={this.handleMetaPickerEntryPress}
                    initEntries={initEntries}
                    type={this.state.metaViewShown}
                    url={this.state.pageUrl}
                    {...this.props}
                />
            </>
        )
    }

    private renderInputs() {
        return (
            <>
                <ActionBar
                    onCancelPress={this.handleModalClose}
                    onConfirmPress={this.handleSave}
                    isConfirming={this.state.saveState === 'running'}
                >
                    {this.state.statusText}
                </ActionBar>
                <NoteInput
                    onChange={this.handleNoteTextChange}
                    value={this.state.noteText}
                    disabled={this.state.saveState === 'running'}
                />
                <StarPage
                    isStarred={this.state.isStarred}
                    onPress={this.handleStarPress}
                    disabled={this.state.saveState === 'running'}
                    loading={this.state.bookmarkState !== 'done'}
                />
                <AddCollection
                    onPress={this.handleMetaViewTypeSwitch('collections')}
                    count={this.state.collectionsToAdd.length}
                    disabled={this.state.saveState === 'running'}
                    loading={this.state.collectionsState !== 'done'}
                />
                <AddTags
                    onPress={this.handleMetaViewTypeSwitch('tags')}
                    count={this.state.tagsToAdd.length}
                    disabled={this.state.saveState === 'running'}
                    loading={this.state.tagsState !== 'done'}
                />
            </>
        )
    }

    private renderUnsupportedApp() {
        return (
            <>
                <ActionBar onCancelPress={this.handleModalClose} />
                <UnsupportedApp />
            </>
        )
    }

    private renderModalContent() {
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
