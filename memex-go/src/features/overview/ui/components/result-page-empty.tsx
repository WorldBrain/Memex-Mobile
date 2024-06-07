import React from 'react'
import { View, Text, TouchableWithoutFeedback } from 'react-native'
import { TouchEventHandler } from 'src/ui/types'

import styles from './result-page-empty.styles'

export interface Props {
    onPairingPress: TouchEventHandler
    onSaveNewPagePress: TouchEventHandler
}

const ResultPageEmpty: React.StatelessComponent<Props> = props => (
    <>
        <View>
            <Text style={styles.title}>Nothing saved yet</Text>
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={props.onPairingPress}>
                    <Text style={styles.linkText}>Sync with your desktop</Text>
                </TouchableWithoutFeedback>
                <Text> or </Text>
                <TouchableWithoutFeedback onPress={props.onSaveNewPagePress}>
                    <Text style={styles.linkText}>save a new page</Text>
                </TouchableWithoutFeedback>
            </View>
        </View>
    </>
)

export default ResultPageEmpty
