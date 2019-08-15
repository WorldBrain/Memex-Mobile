import React from 'react'
import {
    View,
    Text,
    NativeSyntheticEvent,
    NativeTouchEvent,
} from 'react-native'

import ProgressBalls from 'src/ui/components/progress-balls'
import Button from 'src/ui/components/memex-btn'
import styles from './main-layout.styles'

export interface Props {
    btnText: string
    titleText: string
    subtitleText: string
    showScreenProgress?: boolean
    screenIndex?: number
    isComingSoon?: boolean
    onBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const MainLayout: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.titleText}>{props.titleText}</Text>
        <Text style={styles.subtitleText}>{props.subtitleText}</Text>
        {props.isComingSoon && (
            <Text style={styles.comingSoonText}>Coming soon</Text>
        )}
        <View style={styles.children}>{props.children}</View>
        <Button title={props.btnText} onPress={props.onBtnPress} />
        <View style={styles.progress}>
            {props.showScreenProgress && (
                <ProgressBalls count={3} selectedIndex={props.screenIndex} />
            )}
        </View>
    </View>
)

export default MainLayout
