import React from 'react'
import { View, Text } from 'react-native'

import styles from './empty-results.styles'

export interface Props {
    goToPairing: () => void
    goToTutorial: () => void
}

const EmptyResults: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.text}>Nothing saved yet</Text>
        <Text style={styles.subText}>
            <Text style={styles.linkText} onPress={props.goToPairing}>
                Sync with your desktop
            </Text>{' '}
            or{' '}
            <Text style={styles.linkText} onPress={props.goToTutorial}>
                save a new page
            </Text>
        </Text>
    </View>
)

export default EmptyResults
