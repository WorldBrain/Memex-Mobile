import React from 'react'
import { Text, View } from 'react-native'

import SyncLayout from 'src/ui/layouts/sync'
import LoadingBalls from 'src/ui/components/loading-balls'
import styles from './sync-loading-stage.styles'

export interface Props {
    __backToOverview: () => void
}

const SyncLoadingStage: React.StatelessComponent<Props> = props => (
    <SyncLayout
        titleText="Step 4"
        btnText="Next"
        disableMainBtn
        onCancelBtnPress={props.__backToOverview}
    >
        <View style={styles.container}>
            <LoadingBalls style={styles.spinner} />
            <Text style={styles.text}>Syncing in progress</Text>
            <Text style={styles.warningText}>PLEASE DON'T LEAVE THE APP</Text>
        </View>
    </SyncLayout>
)

export default SyncLoadingStage
