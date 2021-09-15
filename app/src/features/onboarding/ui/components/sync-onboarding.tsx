import React from 'react'
import { View, Text, Image } from 'react-native'

import OnboardingFeature from './onboarding-feature'
import styles from './sync-onboarding.styles'
import featureStyles from './onboarding-feature.styles'

export interface Props {}

const SyncOnboarding: React.StatelessComponent<Props> = (props) => (
    <View style={styles.mainContainer}>
        <OnboardingFeature
            headingText="Annotate the Web"
            secondaryText="Highlight and attach notes to sections of websites"
        >
            <Image
                resizeMode="contain"
                style={styles.mainImg}
                source={require('../assets/annotate.png')}
            />
        </OnboardingFeature>
    </View>
)

export default SyncOnboarding
