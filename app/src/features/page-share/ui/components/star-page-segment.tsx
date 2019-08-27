import React from 'react'
import { Image } from 'react-native'

import TouchableSegment, {
    Props as TouchableSegmentProps,
} from './touchable-segment'
import styles from './touchable-segment.styles'

const getIconSource = (props: Props) =>
    props.isStarred
        ? require('src/features/overview/ui/img/star-full.png')
        : require('src/features/overview/ui/img/star.png')

export interface Props extends Omit<TouchableSegmentProps, 'text'> {
    isStarred: boolean
}

const StarPage: React.StatelessComponent<Props> = props => (
    <TouchableSegment text="Star Page" {...props}>
        <Image style={styles.starIcon} source={getIconSource(props)} />
    </TouchableSegment>
)

export default StarPage
