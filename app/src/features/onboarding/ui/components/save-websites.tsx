import React from 'react'
import { Image } from 'react-native'

import OnboardingFeature from './onboarding-feature'
import Share from '../assets/share-button.svg'
import styles from './save-websites.styles'

export interface Props {}

const SaveWebsite: React.StatelessComponent<Props> = props => (
    <OnboardingFeature
        headingText="Save websites on the go"
        secondaryText="Quickly save websites & tweets via the share feature on your device"
    >
        <Image
            resizeMode="contain"
            style={styles.shareImg}
            source={require('../assets/share-button.png')}
        />
        <Image
            resizeMode="contain"
            style={styles.mockupImg}
            source={require('../assets/screen-step1.png')}
        />
    </OnboardingFeature>
)

export default SaveWebsite
