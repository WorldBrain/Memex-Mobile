import React from 'react'
import {
    View,
    Image,
    Text,
    ImageSourcePropType,
    TouchableWithoutFeedback,
} from 'react-native'
import { NativeTouchEventHandler } from '../../types'

import styles from './result-page-body.styles'

export interface Props {
    favIcon?: string
    titleText: string
    pageUrl: string
    domain: string
    fullUrl: string
    onResultPress?: NativeTouchEventHandler
}

const ResultPageBody: React.StatelessComponent<Props> = props => (
    <>
        <TouchableWithoutFeedback onPress={props.onResultPress}>
            <View>
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
