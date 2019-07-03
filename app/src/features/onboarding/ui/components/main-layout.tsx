import React from 'react'
import {
    View,
    Text,
    NativeSyntheticEvent,
    NativeTouchEvent,
} from 'react-native'

import Button from 'src/ui/components/memex-btn'
import styles from './main-layout.styles'

export interface Props {
    btnText: string
    titleText: string
    subtitleText: string
    onBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const MainLayout: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.titleText}>{props.titleText}</Text>
        <Text style={styles.subtitleText}>{props.subtitleText}</Text>
        <View style={styles.gif} />
        <Button title={props.btnText} onPress={props.onBtnPress} />
    </View>
)

export default MainLayout
