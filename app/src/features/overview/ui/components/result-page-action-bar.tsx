import React from 'react'
import { View, Text } from 'react-native'

import { NativeTouchEventHandler } from '../../types'
import { DeleteBtn, ListBtn } from './action-btns'

import styles from './result-page-action-bar.styles'

export interface Props {
    onDeletePress: NativeTouchEventHandler
    onListsPress: NativeTouchEventHandler
    onVisitPress: NativeTouchEventHandler
}

const ResultPageActionBar: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text onPress={props.onVisitPress} style={styles.text}>
            Visit
        </Text>
        <ListBtn onPress={props.onListsPress} />
        <DeleteBtn onPress={props.onDeletePress} />
    </View>
)

export default ResultPageActionBar
