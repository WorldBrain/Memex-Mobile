import React from 'react'
import { View } from 'react-native'
import Modal from 'react-native-modalbox'

import styles from './share-modal.styles'

export interface Props {
    isModalShown: boolean
    stretched?: boolean
    onClosed: () => void
}

const ShareModal: React.StatelessComponent<Props> = props => (
    <Modal
        position="center"
        style={styles.modal}
        onClosed={props.onClosed}
        isOpen={props.isModalShown}
    >
        <View
            style={[
                styles.container,
                props.stretched ? styles.stretched : null,
            ]}
        >
            {props.children}
        </View>
    </Modal>
)

export default ShareModal
