import React from 'react'
import { View } from 'react-native'
import Modal from 'react-native-modalbox'
import EStyleSheet from 'react-native-extended-stylesheet'
import { Platform, Dimensions } from 'react-native'

const { height, width } = Dimensions.get('window')
const entireScreenWidth = Dimensions.get('window').width

EStyleSheet.build({
    $textColor: '#3a2f45',
    $greenColor: '#5cd9a6',
    $rem: entireScreenWidth / 30,
})

import styles from './share-modal.styles'

export interface Props {
    isModalShown: boolean
    stretched?: boolean
    onClosed: () => void
}

const ShareModal: React.StatelessComponent<Props> = props => (
    <Modal
        position="top"
        style={styles.modal}
        onClosed={props.onClosed}
        isOpen={props.isModalShown}
        backdropPressToClose={false}
        swipeToClose={false}
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
