import React from 'react'
import { Text } from 'react-native'

import TouchableSegment, {
    Props as TouchableSegmentProps,
} from './touchable-segment'
import styles from './add-collections-segment.styles'

export interface Props extends Omit<TouchableSegmentProps, 'text'> {
    count: number
}

const AddCollections: React.StatelessComponent<Props> = props => (
    <TouchableSegment text="Add to Collections" {...props}>
        <Text style={styles.count}>{props.count}</Text>
    </TouchableSegment>
)

export default AddCollections
