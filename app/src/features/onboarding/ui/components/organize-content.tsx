import React from 'react'
import { Image } from 'react-native'

import OnboardingFeature from './onboarding-feature'
import styles from './organize-content.styles'

export interface Props {}

const OrganizeContent: React.StatelessComponent<Props> = props => (
    <OnboardingFeature
        headingText="Organise your Websites & Tweets"
        secondaryText="Add tags, collections and notes"
    >
        <Image
            resizeMode="contain"
            style={styles.mockupImg}
            source={require('../assets/screen-step2.png')}
        />
    </OnboardingFeature>
)

export default OrganizeContent
