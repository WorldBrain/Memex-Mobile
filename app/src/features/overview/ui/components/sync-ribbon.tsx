import React from 'react'
import { Text, TouchableOpacity, View, Image } from 'react-native'

import styles from './sync-ribbon.styles'

export interface Props {
    onPress: () => void
}

const SyncRibbon: React.StatelessComponent<Props> = props => (
    <TouchableOpacity style={styles.container} onPress={props.onPress}>
        <View style={styles.ribbonButton}>
            <Image
                resizeMode="contain"
                style={styles.reload}
                source={require('src/ui/img/refresh_white.png')}
            />
            <Text style={styles.text}>New Sync Updates</Text>
        </View>
    </TouchableOpacity>
)

export default SyncRibbon
