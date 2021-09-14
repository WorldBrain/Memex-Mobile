import React from 'react'
import { Image } from 'react-native'

import OnboardingFeature from './onboarding-feature'
import Share from '../assets/share-button.svg'
import styles from './save-websites.styles'

export interface Props {}

const SaveWebsite: React.StatelessComponent<Props> = (props) => (
    <OnboardingFeature
        headingText="Save websites on the go"
        secondaryText="Quickly save websites via the share feature of your phone"
    >
        <Image
            resizeMode="contain"
            style={styles.mockupImg}
            source={require('../assets/screen-step1.png')}
        />
    </OnboardingFeature>
)

export default SaveWebsite
