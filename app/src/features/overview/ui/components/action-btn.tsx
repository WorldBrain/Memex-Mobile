import React from 'react'
import {
    Image,
    ButtonProps,
    TouchableOpacity,
    ImageSourcePropType,
    Text,
    View,
} from 'react-native'

import styles from './action-btn.styles'

export interface Props extends Pick<ButtonProps, 'onPress' | 'disabled'> {
    label?: string
    className?: string
    imgClassName?: string
    fullyOpaque?: boolean
}

interface OwnProps {
    iconSource: ImageSourcePropType
}

export const ActionBtn: React.StatelessComponent<Props & OwnProps> = (
    props,
) => (
    <TouchableOpacity
        style={[styles.actionBtn, props.className]}
        onPress={props.onPress}
        disabled={props.disabled}
    >
        <View style={styles.actionBtnContainer}>
            <Image
                resizeMode="contain"
                source={props.iconSource}
                style={[
                    styles.icon,
                    props.disabled ? styles.iconDisabled : null,
                    props.fullyOpaque && styles.fullyOpaque,
                ]}
            />
            {props.label && (
                <>
                    <View style={styles.marginBottom10} />
                    <Text style={styles.subText} numberOfLines={1}>
                        {props.label}
                    </Text>
                </>
            )}
        </View>
    </TouchableOpacity>
)
