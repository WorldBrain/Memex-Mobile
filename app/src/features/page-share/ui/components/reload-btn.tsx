import React from 'react'
import { Image, TouchableOpacity } from 'react-native'

import styles from './reload-btn.styles'

export interface Props {
    onPress: () => void
}

const ReloadBtn: React.StatelessComponent<Props> = props => (
    <TouchableOpacity style={styles.container} onPress={props.onPress}>
        <Image source={require('src/ui/img/reload.png')} />
    </TouchableOpacity>
)

export default ReloadBtn
