import React from 'react'
import {
    NativeSyntheticEvent,
    NativeTouchEvent,
    Text,
    View,
} from 'react-native'

import styles from './sync-setup-stage.styles'
import sharedStyles from './shared.styles'
import SyncLayout from 'src/ui/layouts/sync'
import DevicePair from '../assets/device-pair.svg'

export interface Props {
    onBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
    onCancelBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const SyncSetupStage: React.StatelessComponent<Props> = props => (
    <SyncLayout
        btnText="OK, got it!"
        titleText="Pair app with your computer"
        {...props}
    >
        <Text style={sharedStyles.stepText}>Step 1</Text>
        <Text style={styles.instructionText}>
            You need to be on the same wifi connection with the devices you are
            trying to pair
        </Text>
        <View style={styles.mainImgContainer}>
            <DevicePair style={styles.mainImg} />
        </View>
    </SyncLayout>
)

export default SyncSetupStage
