import React from 'react';
import { Text, TouchableOpacity, ButtonProps } from 'react-native'

import styles from './memex-btn.styles'

export interface Props extends ButtonProps {
}

const MainLayout: React.StatelessComponent<Props> = props => (
    <TouchableOpacity style={styles.button} onPress={props.onPress}>
        <Text style={styles.text}>{props.title}</Text>
    </TouchableOpacity>
)

export default MainLayout
