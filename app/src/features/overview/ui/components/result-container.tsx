import React from 'react'
import { View } from 'react-native'

import styles from './result-container.styles'

export interface Props {
    isNote?: boolean
    renderFooter: () => JSX.Element
    renderTags: () => JSX.Element
}

const Result: React.StatelessComponent<Props> = props => (
    <View style={[styles.result, props.isNote ? styles.resultNote : null]}>
        {props.children}
        {props.renderFooter()}
        {props.renderTags()}
    </View>
)

export default Result
