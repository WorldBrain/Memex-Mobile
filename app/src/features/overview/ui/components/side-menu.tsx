import React from 'react'
import {
    View,
    Image,
    GestureResponderEvent,
    TouchableOpacity,
} from 'react-native'

import styles from './side-menu.styles'

export interface Props {
    onBackPress: (e: GestureResponderEvent) => void
}

const SideMenu: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <TouchableOpacity onPress={props.onBackPress}>
            <Image
                style={styles.backIcon}
                source={require('src/ui/img/arrow-next.png')}
            />
        </TouchableOpacity>
        {props.children}
    </View>
)

export default SideMenu
