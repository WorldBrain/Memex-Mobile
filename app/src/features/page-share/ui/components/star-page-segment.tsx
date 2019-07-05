import React from 'react'
import { Image, GestureResponderEvent } from 'react-native'

import TouchableSegment from './touchable-segment'
import styles from './touchable-segment.styles'

const getIconSource = (props: Props) =>
    props.isStarred
        ? require('src/features/overview/ui/img/star-full.png')
        : require('src/features/overview/ui/img/star.png')

export interface Props {
    isStarred: boolean
    onPress: (e: GestureResponderEvent) => void
}

const StarPage: React.StatelessComponent<Props> = props => (
    <TouchableSegment onPress={props.onPress} text="Star Page">
        <Image style={styles.starIcon} source={getIconSource(props)} />
    </TouchableSegment>
)

export default StarPage
