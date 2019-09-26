import React from 'react'

import { NavigationScreen } from 'src/ui/types'
import MetaPicker from 'src/features/meta-picker/ui/screens/meta-picker'
import Logic, { State, Event } from './logic'
import { MetaType, MetaTypeShape } from 'src/features/meta-picker/types'
import AddCollection from '../../components/add-collections-segment'
import ShareModal from '../../components/share-modal'
import ActionBar from '../../components/action-bar-segment'
import NoteInput from '../../components/note-input-segment'
import StarPage from '../../components/star-page-segment'
import AddTags from '../../components/add-tags-segment'

interface Props {}

export default class ShareModalScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    async componentDidMount() {
        await this.setSharedUrl()
        await this.setStoredStates()
    }

    private async setSharedUrl() {
        const url = await this.props.services.shareExt.getShareText()
        if (url) {
            this.processEvent('setPageUrl', { url })
        } else {
            this.handleModalClose()
        }
    }

    private async setStoredStates() {
        const { overview, metaPicker } = this.props.storage.modules
        const { pageUrl: url } = this.state

        const isStarred = await overview.isPageStarred({ url })
        const tags = await metaPicker.findTagsByPage({ url })
        const collections = await metaPicker.findListsByPage({ url })
        this.processEvent('setPageStar', { value: isStarred })
        this.processEvent('setTagsToAdd', { values: tags.map(t => t.name) })
        this.processEvent('setCollectionsToAdd', {
            values: collections.map(c => c.name),
        })
    }

    private initHandleMetaShow = (type?: MetaType) => (e: any) => {
        this.processEvent('setMetaViewType', { type })
    }

    private handleSave = async () => {
        this.processEvent('setPageSaving', { value: true })
        await this.storePage()
        this.processEvent('setPageSaving', { value: false })
        this.handleModalClose()
    }

    private async storePage() {
        const { overview, metaPicker, pageEditor } = this.props.storage.modules

        await overview.createPage({
            url: this.state.pageUrl,
            fullUrl: this.state.pageUrl,
            text: '',
            fullTitle: '',
        })
        await overview.visitPage({ url: this.state.pageUrl })
        await overview.setPageStar({
            url: this.state.pageUrl,
            isStarred: this.state.isStarred,
        })

        await metaPicker.setPageLists({
            url: this.state.pageUrl,
            lists: this.state.collectionsToAdd,
        })
        await metaPicker.setPageTags({
            url: this.state.pageUrl,
            tags: this.state.tagsToAdd,
        })

        if (this.state.noteText.trim().length > 0) {
            await pageEditor.createNote({
                comment: this.state.noteText.trim(),
                pageUrl: this.state.pageUrl,
                pageTitle: '',
            })
        }
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

    private handleMetaPickerEntryPress = async (entry: MetaTypeShape) => {
        if (this.state.metaViewShown === 'tags') {
            this.processEvent('toggleTag', { name: entry.name })
        } else {
            this.processEvent('toggleCollection', { name: entry.name })
        }
    }

    private renderMetaPicker() {
        const initEntries =
            this.state.metaViewShown === 'collections'
                ? this.state.collectionsToAdd
                : this.state.tagsToAdd

        return (
            <>
                <ActionBar onCancelPress={this.initHandleMetaShow(undefined)} />
                <MetaPicker
                    type={this.state.metaViewShown}
                    url={this.state.pageUrl}
                    onEntryPress={this.handleMetaPickerEntryPress}
                    initEntries={initEntries}
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
