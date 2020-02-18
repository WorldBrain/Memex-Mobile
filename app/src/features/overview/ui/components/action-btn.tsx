import React from 'react'
import {
    Text,
    Image,
    ButtonProps,
    TouchableOpacity,
    ImageSourcePropType,
    View,
} from 'react-native'

import styles from './action-btn.styles'

export interface Props extends Pick<ButtonProps, 'onPress' | 'disabled'> {}

interface OwnProps {
    iconSource: ImageSourcePropType
}

const ActionBtn: React.StatelessComponent<Props & OwnProps> = props => (
    <TouchableOpacity
        style={styles.actionBtn}
        onPress={props.onPress}
        disabled={props.disabled}
    >
        <Image
            resizeMode="contain"
            source={props.iconSource}
            style={[styles.icon, props.disabled ? styles.iconDisabled : null]}
        />
    </TouchableOpacity>
)

export default ActionBtn
