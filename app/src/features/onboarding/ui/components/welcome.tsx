import React from 'react'
import { Text, View } from 'react-native'

import Button from 'src/ui/components/memex-btn'
import EmptyLayout from 'src/ui/layouts/empty'
import styles from './welcome.styles'

export interface Props {
    onGetStartedPress: () => void
}

const WelcomeScreen: React.StatelessComponent<Props> = ({
    onGetStartedPress,
}) => (
    <EmptyLayout>
        <View style={styles.logo} />
        <Text style={styles.mainText}>Let's get you set up</Text>
        <Button
            style={styles.btn}
            title="Get Started"
            onPress={onGetStartedPress}
        />
    </EmptyLayout>
)

export default WelcomeScreen
