import React from 'react'
import { View, Text } from 'react-native'

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
        <Text style={styles.mainText}>
            Your content was saved but there was a sync error
        </Text>
        <Text style={styles.errMsgTitle}>Error message:</Text>
        <Text style={styles.errMsg}>{props.errorMessage}</Text>
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
