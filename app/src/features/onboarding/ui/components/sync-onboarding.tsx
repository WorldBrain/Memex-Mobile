import React from 'react'
import { View, Text, Image } from 'react-native'

import OnboardingFeature from './onboarding-feature'
import styles from './sync-onboarding.styles'
import featureStyles from './onboarding-feature.styles'

export interface Props {}

const SyncOnboarding: React.StatelessComponent<Props> = (props) => (
    <OnboardingFeature
        headingText="Annotate Websites & Videos"
        secondaryText="Highlight and attach notes to sections of websites via the in-app reader"
    >
        <Image
            resizeMode="contain"
            style={styles.mainImg}
            source={require('../assets/annotate.png')}
        />
    </OnboardingFeature>
)

export default SyncOnboarding
