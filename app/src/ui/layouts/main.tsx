import React from 'react'
import {
    View,
    Text,
    NativeSyntheticEvent,
    NativeTouchEvent,
} from 'react-native'

import ProgressBalls from 'src/ui/components/progress-balls'
import Button from 'src/ui/components/memex-btn'
import EmptyLayout from './empty'
import styles from './main.styles'

export interface Props {
    btnText: string
    titleText: string
    subtitleText: string
    showScreenProgress?: boolean
    isComingSoon?: boolean
    onBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const MainLayout: React.StatelessComponent<Props> = props => (
    <EmptyLayout>
        <Text style={styles.titleText}>{props.titleText}</Text>
        <Text style={styles.subtitleText}>{props.subtitleText}</Text>
        <View style={styles.comingSoonContainer}>
            {props.isComingSoon && (
                <Text style={styles.comingSoonText}>Coming soon</Text>
            )}
        </View>
        <View style={styles.children}>{props.children}</View>
        <Button title={props.btnText} onPress={props.onBtnPress} />
        <View style={styles.progressContainer}>
            {props.showScreenProgress && (
                <ProgressBalls count={3} selectedIndex={props.screenIndex} />
            )}
        </View>
    </EmptyLayout>
)

export default MainLayout
