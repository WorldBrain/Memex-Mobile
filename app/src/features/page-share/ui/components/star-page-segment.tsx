import React from 'react'
import { Text, GestureResponderEvent } from 'react-native'

import TouchableSegment from './touchable-segment'

export interface Props {
    isStarred: boolean
    onPress: (e: GestureResponderEvent) => void
}

const StarPage: React.StatelessComponent<Props> = props => (
    <TouchableSegment onPress={props.onPress} text="Star Page">
        <Text>{props.isStarred ? 'STARRED' : 'STAR'}</Text>
    </TouchableSegment>
)

export default StarPage
