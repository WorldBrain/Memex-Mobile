import React from 'react'
import { View, GestureResponderEvent, TouchableOpacity } from 'react-native'

import styles from './side-menu.styles'

export interface Props {
    onBackPress: (e: GestureResponderEvent) => void
}

const SideMenu: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <TouchableOpacity onPress={props.onBackPress}>
            <View style={styles.backIcon} />
        </TouchableOpacity>
        {props.children}
    </View>
)

export default SideMenu
