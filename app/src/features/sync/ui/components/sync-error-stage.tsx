import React from 'react'
import { Text, View } from 'react-native'

import EmptyLayout from 'src/ui/layouts/empty'
import Button from 'src/ui/components/memex-btn'
import styles from './sync-error-stage.styles'
import Link from 'src/ui/components/link'

export interface Props {
    onBtnPress: () => void
    onSupportBtnPress: () => void
    onCancelBtnPress: () => void
    errorText: string
}

const HelpEntry: React.StatelessComponent<{}> = props => (
    <View style={[styles.helpEntry, styles.bottomBorder]}>
        <Text style={styles.helpEntryText}>{props.children}</Text>
        <Text style={styles.helpEntryArrow}>></Text>
    </View>
)

const SyncErrorStage: React.StatelessComponent<Props> = props => (
    <EmptyLayout>
        <Text style={styles.titleText}>Oops</Text>
        <View style={styles.errorTextContainer}>
            <Text style={styles.errorText}>{props.errorText}</Text>
        </View>
        <View style={styles.helpContainer}>
            <View style={styles.bottomBorder}>
                <Text style={styles.helpHeader}>Help</Text>
            </View>
            <Text style={styles.helpEntryText}>
                If you run into troubles while syncing, check out the{' '}
                <Link href="https://www.notion.so/worldbrain/d1ccb11785774c389c621b44f65bb543">
                    Troubleshooting Help
                </Link>
                <Text style={styles.helpEntryText}> or </Text>
                <Link href="https://community.worldbrain.io/c/bug-reports">
                    Contact Support
                </Link>
                <Text style={styles.helpEntryText}>.</Text>
            </Text>
        </View>
        <View style={styles.cancelContainer}>
            <Button
                style={styles.cancelButton}
                title="Cancel"
                onPress={props.onCancelBtnPress}
                empty
            />
        </View>
    </EmptyLayout>
)

export default SyncErrorStage
