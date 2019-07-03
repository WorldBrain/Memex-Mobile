import React from 'react'
import { View, Text } from 'react-native'

import styles from './result-footer.styles'

export interface Props {
    date: string
}

const ResultFooter: React.StatelessComponent<Props> = props => (
    <View style={styles.footer}>
        <Text style={styles.date}>{props.date}</Text>
        <View style={styles.actionBtns}>{props.children}</View>
    </View>
)

export default ResultFooter
