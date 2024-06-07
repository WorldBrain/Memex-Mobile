import React from 'react'
import { TouchableOpacity, Image } from 'react-native'

import styles from './reload-btn.styles'

export interface Props {
    onPress: () => void
}

const reloadImg = require('src/ui/img/reload.png')

const ReloadBtn: React.StatelessComponent<Props> = props => (
    <TouchableOpacity style={styles.container} onPress={props.onPress}>
        <Image resizeMode="contain" style={styles.img} source={reloadImg} />
    </TouchableOpacity>
)

export default ReloadBtn
