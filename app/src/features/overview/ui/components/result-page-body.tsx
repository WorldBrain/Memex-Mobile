import React from 'react'
import {
    View,
    Image,
    Text,
    ImageSourcePropType,
    TouchableWithoutFeedback,
} from 'react-native'
import { TouchEventHandler } from 'src/ui/types'

import styles from './result-page-body.styles'

export interface Props {
    favIcon?: string
    titleText: string
    pageUrl: string
    domain: string
    fullUrl: string
    onResultPress?: TouchEventHandler
    date: string
}

const ResultPageBody: React.StatelessComponent<Props> = (props) => (
    <>
        <TouchableWithoutFeedback onPress={props.onResultPress}>
            <View style={styles.contentBox}>
                <View style={styles.title}>
                    <Text style={styles.titleText}>{props.titleText}</Text>
                </View>
                <View style={styles.bottomBarBox}>
                    <Text numberOfLines={1} style={styles.linkText}>
                        {props.domain}
                    </Text>
                    <Text style={styles.date}>{props.date}</Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    </>
)

export default ResultPageBody
