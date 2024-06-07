import React from 'react'
import { View, Text, ScrollView } from 'react-native'

import styles from './sync-error.styles'
import Button from 'src/ui/components/memex-btn'

export interface Props {
    isRetrying: boolean
    errorMessage: string
    onRetryPress: () => void
    onReportPress: () => void
}

const SyncError: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.mainText}>Sync error</Text>
        <Text style={styles.subText}>
            Content saved but not synced. {'\n'} Sync via the main app.
        </Text>
        <Text style={styles.errMsgTitle}>Error message:</Text>
        <ScrollView>
            <Text style={styles.errMsg}>{props.errorMessage}</Text>
        </ScrollView>
        <View style={styles.buttonContainer}>
            <Button
                title="Report issue"
                style={styles.reportBtn}
                onPress={props.onReportPress}
                empty
            />
            <Button
                title="Retry"
                style={styles.reportBtn}
                onPress={props.onRetryPress}
                isLoading={props.isRetrying}
                empty
            />
        </View>
    </View>
)

export default SyncError
