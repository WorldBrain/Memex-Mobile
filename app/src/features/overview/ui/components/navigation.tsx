import React from 'react'
import {
    View,
    Text,
    Image,
    GestureResponderEvent,
    TouchableOpacity,
} from 'react-native'

import styles from './navigation.styles'

export interface Props {
    onBackPress: (e: GestureResponderEvent) => void
}

const Navigation: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <TouchableOpacity
            style={styles.btnContainer}
            onPress={props.onBackPress}
        >
            <Image
                style={styles.backIcon}
                source={require('src/ui/img/arrow-prev.png')}
            />
        </TouchableOpacity>
        <Text style={styles.text}>{props.children}</Text>
    </View>
)

export default Navigation
