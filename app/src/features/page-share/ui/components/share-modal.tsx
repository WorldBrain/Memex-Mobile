import React from 'react';
import { View } from 'react-native'
import Modal from 'react-native-modalbox'

import styles from './share-modal.styles'

export interface Props {
    isModalShown: boolean
    onClosed: () => void
}

const ShareModal: React.StatelessComponent<Props> = props => (
    <Modal
        position="center"
        style={styles.modal}
        onClosed={props.onClosed}
        isOpen={props.isModalShown}
    >
        <View style={styles.container}>
            {props.children}
        </View>
    </Modal>
)

export default ShareModal
