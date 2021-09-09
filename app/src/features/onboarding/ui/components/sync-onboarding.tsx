import React from 'react'
import { View, Text, Image } from 'react-native'

import OnboardingFeature from './onboarding-feature'
import styles from './sync-onboarding.styles'
import featureStyles from './onboarding-feature.styles'

export interface Props {}

const SyncOnboarding: React.StatelessComponent<Props> = (props) => (
    <View style={styles.mainContainer}>
        <OnboardingFeature
            optional="OPTIONAL"
            headingText="Sync with your computer"
            secondaryText="Sync is End2End encrypted. We will never know anything about your data"
        >
            <Image
                resizeMode="contain"
                style={styles.mainImg}
                source={require('../assets/device-pair.png')}
            />
        </OnboardingFeature>
    </View>
)

export default SyncOnboarding
