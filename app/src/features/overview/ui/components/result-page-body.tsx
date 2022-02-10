import React from 'react'
import { View, Text, TouchableWithoutFeedback } from 'react-native'
import type { TouchEventHandler } from 'src/ui/types'
import type { UIPage } from '../../types'
import styles from './result-page-body.styles'

export interface Props extends UIPage {
    onResultPress?: TouchEventHandler
    date: string
}

const ResultPageBody: React.StatelessComponent<Props> = (props) => (
    <View>
        <View style={styles.contentBox}>
            <View style={styles.title}>
                <Text style={styles.titleText}>{props.titleText}</Text>
            </View>
            <View style={styles.bottomBarBox}>
                {props.type !== 'page' && (
                    <Text style={styles.pdfIcon}>PDF</Text>
                )}
                <Text numberOfLines={1} style={styles.linkText}>
                    {props.domain}
                </Text>
                <Text style={styles.date}>{props.date}</Text>
            </View>
        </View>
    </View>
)

export default ResultPageBody
