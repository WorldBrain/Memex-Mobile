import React from 'react'
import { Text, GestureResponderEvent } from 'react-native'

import TouchableSegment from './touchable-segment'
import styles from './add-collections-segment.styles'

export interface Props {
    count: number
    onPress: (e: GestureResponderEvent) => void
}

const AddCollections: React.StatelessComponent<Props> = props => (
    <TouchableSegment onPress={props.onPress} text="Add to Collections">
        <Text style={styles.count}>{props.count}</Text>
    </TouchableSegment>
)

export default AddCollections
