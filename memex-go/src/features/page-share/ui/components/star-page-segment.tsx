import React from 'react'
import { Image } from 'react-native'

import TouchableSegment, {
    Props as TouchableSegmentProps,
} from './touchable-segment'
import styles from './touchable-segment.styles'

const getIconSource = (props: Props) =>
    props.isStarred
        ? require('src/features/overview/ui/img/heart_full.png')
        : require('src/features/overview/ui/img/heart_empty.png')

export interface Props extends Omit<TouchableSegmentProps, 'text'> {
    isStarred: boolean
}

const StarPage: React.StatelessComponent<Props> = props => (
    <TouchableSegment text="Bookmark this" {...props}>
        <Image
            style={styles.starIcon}
            resizeMode="contain"
            source={getIconSource(props)}
        />
    </TouchableSegment>
)

export default StarPage
