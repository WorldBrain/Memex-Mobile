import React from 'react'
import { Text, GestureResponderEvent } from 'react-native'

import TouchableSegment from './touchable-segment'
import styles from './add-tags-segment.styles'

export interface Props {
    count: number
    onPress: (e: GestureResponderEvent) => void
}

const AddTags: React.StatelessComponent<Props> = props => (
    <TouchableSegment onPress={props.onPress} text="Add Tags" skipBottomBorder>
        <Text style={styles.count}>{props.count}</Text>
    </TouchableSegment>
)

export default AddTags
