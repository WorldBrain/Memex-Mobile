import React from 'react'
import { View, Text } from 'react-native'

import styles from './result-page-tags.styles'

export interface Props {
    style?: string
    tags: string[]
}

const TagPill: React.StatelessComponent<{}> = props => (
    <View style={styles.tagPill}>
        <Text style={styles.tagPillText}>{props.children}</Text>
    </View>
)

const ResultPageTags: React.StatelessComponent<Props> = props =>
    props.tags.length === 0 ? null : (
        <View style={[styles.container, props.style]}>
            {props.tags.map((tag, i) => (
                <TagPill key={i}>{tag}</TagPill>
            ))}
        </View>
    )

export default ResultPageTags
