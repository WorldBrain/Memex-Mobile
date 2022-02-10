import React from 'react'
import { View } from 'react-native'

import ProgressBalls from 'src/ui/components/progress-balls'
import Button from 'src/ui/components/memex-btn'
import EmptyLayout from './empty'
import styles from './onboarding.styles'
import { PrimaryAction } from '../utils/ActionButtons'
export interface Props {
    onBackPress: () => void
    onNextPress: () => void
    onSkipPress: () => void
    screenIndex: number
    showBackBtn?: boolean
    children: React.ReactNode
}

const OnboardingLayout: React.StatelessComponent<Props> = (props) => (
    <EmptyLayout style={styles.background}>
        {props.children}

        <View style={styles.mainContainer}>
            <ProgressBalls count={3} selectedIndex={props.screenIndex} />

            {props.screenIndex === 2 ? (
                <View style={styles.btnContainer}>
                    <Button
                        title="Back"
                        onPress={props.onBackPress}
                        hidden={!props.showBackBtn}
                        empty
                    />
                    <PrimaryAction
                        label="Finish Onboarding"
                        onPress={props.onNextPress}
                        width="170px"
                    />
                    <Button title="Skip" onPress={props.onSkipPress} empty />
                </View>
            ) : (
                <View style={styles.btnContainer}>
                    <Button
                        title="Back"
                        onPress={props.onBackPress}
                        hidden={!props.showBackBtn}
                        empty
                    />
                    <PrimaryAction
                        label="Next"
                        onPress={props.onNextPress}
                        width="170px"
                    />
                    <Button title="Skip" onPress={props.onSkipPress} empty />
                </View>
            )}
        </View>
    </EmptyLayout>
)

export default OnboardingLayout
