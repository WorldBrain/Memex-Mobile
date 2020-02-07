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
                    <Text style={styles.titleText}>{props.titleText}</Text>
                </View>
                <Text style={styles.linkText}>{props.pageUrl}</Text>
            </View>
        </TouchableWithoutFeedback>
    </>
)

export default ResultPageBody
