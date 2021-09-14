import React, { useState, useEffect } from 'react'
import { View, Text, Image, Dimensions, Platform } from 'react-native'
import { useDeviceOrientation } from '@react-native-community/hooks'

import styles from './onboarding-feature.styles'
import { or } from 'react-native-reanimated'

export interface Props {
    optional?: string
    headingText: string
    secondaryText: string
}

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

const OnboardingFeature = (props) => {
    const orientation = useDeviceOrientation()
    // const [orientation , setOrientation] = useState(true);

    // useEffect(() => {
    //     console.log("Effect Run");
    //     Dimensions.addEventListener('change', () => {
    //         setOrientation(orientationInfo.portrait ? true : false);
    //     })
    // })

    return (
        <View style={styles.mainContainer}>
            <View style={styles.imgContainer}>{props.children}</View>
            <View style={styles.textContainer}>
                <Text style={styles.headingText}>{props.headingText}</Text>
                <Text style={styles.secondaryText}>{props.secondaryText}</Text>
            </View>
        </View>
    )
}

export default OnboardingFeature
