import React from 'react'

import {
    NavigationScreen,
    NavigationProps,
    UIServices,
    UIStorageModules,
} from 'src/ui/types'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import Logic, { State, Event, LogicDependencies } from './logic'
import { MetaType, MetaTypeShape } from 'src/features/meta-picker/types'
import AddCollection from '../../components/add-collections-segment'
import ShareModal from '../../components/share-modal'
import ActionBar from '../../components/action-bar-segment'
import NoteInput from '../../components/note-input-segment'
import StarPage from '../../components/star-page-segment'
import AddTags from '../../components/add-tags-segment'

type Props = NavigationProps & LogicDependencies

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
        this.processEvent('metaPickerEntryPress', { entry })
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
                    type={this.state.metaViewShown}
                    url={this.state.pageUrl}
                    onEntryPress={this.handleMetaPickerEntryPress}
                    initEntries={initEntries}
                    isSyncLoading={this.state.syncState === 'running'}
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
                />
                <AddCollection
                    onPress={this.handleMetaViewTypeSwitch('collections')}
                    count={this.state.collectionsToAdd.length}
                    disabled={this.state.saveState === 'running'}
                />
                <AddTags
                    onPress={this.handleMetaViewTypeSwitch('tags')}
                    count={this.state.tagsToAdd.length}
                    disabled={this.state.saveState === 'running'}
                />
            </>
        )
    }

    render() {
        return (
            <ShareModal
                isModalShown={this.state.isModalShown}
                onClosed={this.props.services.shareExt.close}
                stretched={!!this.state.metaViewShown}
            >
                {this.state.metaViewShown
                    ? this.renderMetaPicker()
                    : this.renderInputs()}
            </ShareModal>
        )
    }
}
