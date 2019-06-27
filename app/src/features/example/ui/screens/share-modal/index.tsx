import React from 'react';
import { TouchableOpacity, Text} from 'react-native'
import Modal from 'react-native-modalbox'

import { ShareExt } from 'src/services/share-ext'
import { StatefulUIElement } from 'src/ui/types'
import Logic, { Event, State } from './logic'
import ShareOutput from '../share-output'

export interface Props {}

export default class ShareModal extends StatefulUIElement<Props, State, Event> {
    private shareMenu: ShareExt

    constructor(props : Props) {
        super(props, { logic: new Logic() })
        this.shareMenu = new ShareExt({})
    }

    handleClose = () => this.processEvent('setIsShown', { isShown: false })

    render() {
        return (
            <Modal
                backdrop={false}
                style={{ backgroundColor: 'transparent' }}
                position="center"
                isOpen={this.state.isShown}
                onClosed={this.shareMenu.close}
            >
                <TouchableOpacity onPress={this.handleClose}>
                    <Text>Close</Text>
                </TouchableOpacity>
                <ShareOutput />
            </Modal>
        )
    }
}
