import React from 'react'

import { NavigationScreen } from 'src/ui/types'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import Logic, { State, Event } from './logic'
import { MetaType } from 'src/features/meta-picker/types'
import AddCollection from '../../components/add-collections-segment'
import ShareModal from '../../components/share-modal'
import ActionBar from '../../components/action-bar-segment'
import NoteInput from '../../components/note-input-segment'
import StarPage from '../../components/star-page-segment'
import AddTags from '../../components/add-tags-segment'
import delay from 'src/utils/delay'

interface Props {}

export default class ShareModalScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    componentDidMount() {
        this.setSharedUrl()
    }

    private async setSharedUrl() {
        const url = await this.props.services.shareExt.getShareText()
        if (url) {
            this.processEvent('setPageUrl', { url })
        } else {
            this.handleModalClose()
        }
    }

    private initHandleMetaShow = (type: MetaType) => (e: any) => {
        this.processEvent('setMetaViewType', { type })
    }

    private handleSave = async () => {
        this.processEvent('setPageSaving', { value: true })
        await delay(2000)
        this.processEvent('setPageSaving', { value: false })
        this.handleModalClose()
    }


    private handleModalClose = () => {
        this.processEvent('setModalVisible', { shown: false })
        this.props.services.shareExt.close()
    }

    private handleStarPress = () => {
        this.processEvent('setPageStar', {
            value: !this.state.isStarred,
        })
    }

    private renderMetaPicker() {
        return (
            <>
                <ActionBar
                    onCancelPress={() =>
                        this.processEvent('setMetaViewType', {
                            type: undefined,
                        })
                    }
                />
                <MetaPicker
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
                    isConfirming={this.state.isPageSaving}
                >
                    {this.state.statusText}
                </ActionBar>
                <NoteInput
                    onChange={value =>
                        this.processEvent('setNoteText', { value })
                    }
                    value={this.state.noteText}
                    disabled={this.state.isPageSaving}
                />
                <StarPage
                    isStarred={this.state.isStarred}
                    onPress={this.handleStarPress}
                    disabled={this.state.isPageSaving}
                />
                <AddCollection
                    onPress={this.initHandleMetaShow('collections')}
                    count={this.state.collectionsToAdd.length}
                    disabled={this.state.isPageSaving}
                />
                <AddTags
                    onPress={this.initHandleMetaShow('tags')}
                    count={this.state.tagsToAdd.length}
                    disabled={this.state.isPageSaving}
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
