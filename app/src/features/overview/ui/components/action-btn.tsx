import React from 'react'
import {
    Image,
    ButtonProps,
    TouchableOpacity,
    ImageSourcePropType,
} from 'react-native'

import styles from './action-btn.styles'

export interface Props extends Pick<ButtonProps, 'onPress' | 'disabled'> {
    className?: string
    imgClassName?: string
}

interface OwnProps {
    iconSource: ImageSourcePropType
}

export const ActionBtn: React.StatelessComponent<Props & OwnProps> = props => (
    <TouchableOpacity
        style={[styles.actionBtn, props.className]}
        onPress={props.onPress}
        disabled={props.disabled}
    >
        <Image
            resizeMode="contain"
            source={props.iconSource}
            style={[
                styles.icon,
                props.disabled ? styles.iconDisabled : null,
                props.imgClassName,
            ]}
        />
    </TouchableOpacity>
)
