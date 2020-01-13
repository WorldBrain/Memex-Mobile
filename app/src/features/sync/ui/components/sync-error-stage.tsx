import React from 'react'
import { Text, View } from 'react-native'

import EmptyLayout from 'src/ui/layouts/empty'
import Button from 'src/ui/components/memex-btn'
import styles from './sync-error-stage.styles'

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
            <HelpEntry>Wifi connection</HelpEntry>
            <HelpEntry>Account credentials</HelpEntry>
            <HelpEntry>Known bugs</HelpEntry>
            <HelpEntry>Extension version</HelpEntry>
        </View>
        <Button title="Try Again" onPress={props.onBtnPress!} />
        <Button
            title="Send support request"
            onPress={props.onSupportBtnPress!}
            empty
        />
        <Button title="Cancel" onPress={props.onCancelBtnPress} empty />
    </EmptyLayout>
)

export default SyncErrorStage
