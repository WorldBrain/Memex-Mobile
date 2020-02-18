import React from 'react'
import {
    View,
    Image,
    Text,
    ImageSourcePropType,
    TouchableWithoutFeedback,
} from 'react-native'
import { NativeTouchEventHandler } from 'src/features/overview/types'

import styles from './page-body-summary.styles'

export interface Props {
    favIcon?: string
    titleText: string
    pageUrl: string
    domain: string
    fullUrl: string
    onResultPress?: NativeTouchEventHandler
    date: string
}

const ResultPageBody: React.StatelessComponent<Props> = props => (
    <>
        <TouchableWithoutFeedback onPress={props.onResultPress}>
            <View style={styles.contentBox}>
                <View style={styles.title}>
                    {props.favIcon && (
                        <Image
                            style={styles.favIcon}
                            source={{ uri: props.favIcon }}
                        />
                    )}
                    <Text numberOfLines={1} style={styles.titleText}>
                        {props.titleText}
                    </Text>
                </View>
                <Text numberOfLines={1} style={styles.linkText}>
                    {props.domain}
                </Text>
            </View>
        </TouchableWithoutFeedback>
    </>
)

export default ResultPageBody
