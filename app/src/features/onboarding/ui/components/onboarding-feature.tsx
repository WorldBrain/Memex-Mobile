import React from 'react'
import { View, Text, Image } from 'react-native'

import styles from './onboarding-feature.styles'

export interface Props {
    headingText: string
    secondaryText: string
}

const OnboardingFeature: React.StatelessComponent<Props> = props => (
    <View style={styles.mainContainer}>
        <View style={styles.imgContainer}>{props.children}</View>
        <View style={styles.textContainer}>
            <Text style={styles.headingText}>{props.headingText}</Text>
            <Text style={styles.secondaryText}>{props.secondaryText}</Text>
        </View>
    </View>
)

export default OnboardingFeature
