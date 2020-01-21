import React from 'react'
import { TextInput, View } from 'react-native'

import Button from 'src/ui/components/memex-btn'
import styles from './manual-sync-input.styles'

export interface Props {
    manualInputValue: string
    onManualInputChange: (text: string) => void
    onManualInputSubmit: () => void
}

const ManualSyncInput: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <TextInput
            style={styles.input}
            onChangeText={props.onManualInputChange}
            value={props.manualInputValue}
            placeholder="Add sync message here"
            autoCapitalize="none"
        />
        <Button
            style={styles.button}
            onPress={props.onManualInputSubmit}
            title="Sync"
        />
    </View>
)

export default ManualSyncInput
