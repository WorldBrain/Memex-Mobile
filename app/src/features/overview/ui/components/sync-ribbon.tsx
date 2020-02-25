import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

import styles from './sync-ribbon.styles'

export interface Props {
    onPress: () => void
}

const SyncRibbon: React.StatelessComponent<Props> = props => (
    <TouchableOpacity style={styles.container} onPress={props.onPress}>
        <Text style={styles.text}>New Sync Updates</Text>
    </TouchableOpacity>
)

export default SyncRibbon
