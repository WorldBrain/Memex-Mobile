import React from 'react'
import { Image } from 'react-native'

import OnboardingFeature from './onboarding-feature'
import Share from '../assets/share-button.svg'
import styles from './save-websites.styles'

export interface Props {}

const SaveWebsite: React.StatelessComponent<Props> = props => (
    <OnboardingFeature
        headingText="Save websites on the go"
        secondaryText="Easily save any website to your Memex using the share feature on your device"
    >
        <Share style={styles.shareImg} />
        <Image
            style={styles.mockupImg}
            source={require('../assets/screen-step1.png')}
        />
    </OnboardingFeature>
)

export default SaveWebsite
