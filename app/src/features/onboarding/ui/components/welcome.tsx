import React from 'react'
import { Text, View } from 'react-native'

import Button from 'src/ui/components/memex-btn'
import EmptyLayout from 'src/ui/layouts/empty'
import styles from './welcome.styles'

export interface Props {
    onGetSyncedPress: () => void
    onOnboardingPress: () => void
}

const WelcomeScreen: React.StatelessComponent<Props> = props => (
    <EmptyLayout>
        <View style={styles.logo} />
        <Text style={styles.mainText}>
            Memex requires some setup to sync with your other devices.
        </Text>
        <View style={styles.btnContainer}>
            <Button
                title="Learn how to use"
                onPress={props.onOnboardingPress}
                secondary
            />
            <Button
                title="Let's get synced!"
                onPress={props.onGetSyncedPress}
            />
        </View>
    </EmptyLayout>
)

export default WelcomeScreen
