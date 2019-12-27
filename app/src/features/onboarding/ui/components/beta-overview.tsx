import React from 'react'
import { View, Text } from 'react-native'

import OverviewItem from './beta-overview-item'
import styles from './beta-overview.styles'
import featureStyles from './onboarding-feature.styles'

export interface Props {}

const BetaOverview: React.StatelessComponent<Props> = props => (
    <View style={styles.mainContainer}>
        <Text style={featureStyles.headingText}>Memex mobile is in beta</Text>
        <View style={styles.checkList}>
            <OverviewItem
                headingText="Share page to your desktop app"
                checked
            />
            <OverviewItem
                checked
                headingText="Add tags, collections and notes"
            />
            <Text style={styles.comingSoonText}>Coming soon</Text>
            <OverviewItem headingText="Highlight Text" />
            <OverviewItem
                headingText="Dashboard"
                secondaryText="Access and search through all your synced bookmarks"
            />
        </View>
    </View>
)

export default BetaOverview
