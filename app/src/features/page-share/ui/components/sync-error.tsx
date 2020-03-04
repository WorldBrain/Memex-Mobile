import React from 'react'
import { View, Text } from 'react-native'

import styles from './sync-error.styles'
import Button from 'src/ui/components/memex-btn'

export interface Props {
    errorMessage: string
    onReportPress: () => void
}

const SyncError: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.mainText}>
            Your content was saved but there was a sync error
        </Text>
        <Button
            style={styles.reportBtn}
            title="Report >>"
            onPress={props.onReportPress}
            empty
        />
        <Text style={styles.errMsg}>{props.errorMessage}</Text>
    </View>
)

export default SyncError
