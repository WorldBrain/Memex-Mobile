import React from 'react'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import { ShareExt } from 'src/services/share-ext'
import ShareModal from '../../components/share-modal'
import ActionBar from '../../components/action-bar-segment'
import NoteInput from '../../components/note-input-segment'
import StarPage from '../../components/star-page-segment'
import AddCollection from '../../components/add-collections-segment'
import AddTags from '../../components/add-tags-segment'
import { MetaPickerType } from '../../../types'

interface Props {}

export default class ShareModalScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    private shareExt: ShareExt

    constructor(props: Props) {
        super(props, { logic: new Logic() })
        this.shareExt = new ShareExt({})
    }

    private initHandleMetaShow = (type: MetaPickerType) => e =>
        this.processEvent('setMetaViewType', { type })

    private handleClose = () => {
        this.shareExt.close()

        this.processEvent('setModalVisible', { shown: false })
    }

    render() {
        return (
            <ShareModal
                isModalShown={this.state.isModalShown}
                onClosed={this.handleClose}
            >
                <ActionBar
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
            </ShareModal>
        )
    }
}
