import React from 'react'
import { NativeSyntheticEvent, NativeTouchEvent, Text } from 'react-native'

import styles from './sync-setup-stage.styles'
import sharedStyles from './shared.styles'
import MainLayout from 'src/ui/components/main-layout'

export interface Props {
    onBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const SyncSetupStage: React.StatelessComponent<Props> = props => (
    <MainLayout
        btnText="Next"
        titleText="Pair app with your computer"
        subtitleText="To use this app, connect it to your Memex"
        {...props}
    >
        <Text style={sharedStyles.stepText}>Step 1</Text>
        <Text style={styles.instructionText}>
            Open <Text style={styles.boldText}>worldbrain.io/sync</Text> on your
            desktop browser and follow the instructions
        </Text>
    </MainLayout>
)

export default SyncSetupStage
