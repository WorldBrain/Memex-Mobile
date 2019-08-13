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

interface Props {}

export default class ShareModalScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private initHandleMetaShow = (type: MetaType) => (e: any) =>
        this.processEvent('setMetaViewType', { type })

    private handleClose = () => {
        this.props.services.shareExt.close()

        this.processEvent('setModalVisible', { shown: false })
    }

    renderMetaPicker() {
        return (
            <>
                <ActionBar
                    cancelBtnText="Back"
                    onCancelPress={() =>
                        this.processEvent('setMetaViewType', {
                            type: undefined,
                        })
                    }
                />
                <MetaPicker type={this.state.metaViewShown} {...this.props} />
            </>
        )
    }

    renderInputs() {
        return (
            <>
                <ActionBar
                    cancelBtnText="Undo"
                    onCancelPress={this.handleClose}
                    onConfirmPress={this.handleClose}
                >
                    {this.state.statusText}
                </ActionBar>
                <NoteInput
                    onChange={value =>
                        this.processEvent('setNoteText', { value })
                    }
                    value={this.state.noteText}
                />
                <StarPage
                    isStarred={this.state.isStarred}
                    onPress={e =>
                        this.processEvent('setPageStar', {
                            value: !this.state.isStarred,
                        })
                    }
                />
                <AddCollection
                    onPress={this.initHandleMetaShow('collections')}
                    count={this.state.collectionCount}
                />
                <AddTags
                    onPress={this.initHandleMetaShow('tags')}
                    count={this.state.tagCount}
                />
            </>
        )
    }

    render() {
        return (
            <ShareModal
                isModalShown={this.state.isModalShown}
                onClosed={this.handleClose}
                stretched={!!this.state.metaViewShown}
            >
                {this.state.metaViewShown
                    ? this.renderMetaPicker()
                    : this.renderInputs()}
            </ShareModal>
        )
    }
}
