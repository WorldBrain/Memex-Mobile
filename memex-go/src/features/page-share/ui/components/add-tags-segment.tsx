import React from 'react'
import { Text } from 'react-native'

import TouchableSegment, {
    Props as TouchableSegmentProps,
} from './touchable-segment'
import styles from './add-tags-segment.styles'

export interface Props extends Omit<TouchableSegmentProps, 'text'> {
    count: number
}

const AddTags: React.StatelessComponent<Props> = props => (
    <TouchableSegment text="Add Tags" {...props} skipBottomBorder>
        <Text style={styles.count}>{props.count}</Text>
    </TouchableSegment>
)

export default AddTags
