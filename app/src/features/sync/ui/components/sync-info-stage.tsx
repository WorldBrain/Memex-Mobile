import React from 'react'
import {
    NativeSyntheticEvent,
    NativeTouchEvent,
    Text,
    View,
} from 'react-native'

import styles from './sync-setup-stage.styles'
import SyncLayout from 'src/ui/layouts/sync'
import SyncExt from '../assets/sync-ext.svg'

export interface Props {
    onBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
    onCancelBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const SyncInfoStage: React.StatelessComponent<Props> = props => (
    <SyncLayout titleText="Step 2" btnText="Next" {...props}>
        <Text style={styles.instructionText}>
            <Text style={styles.boldText}>Login </Text>
            to your account on your desktop browser extension and head to
            <Text style={styles.boldText}> Settings > Sync Devices </Text>
            to generate a QR code
        </Text>
        <View style={styles.mainImgContainer}>
            <SyncExt style={styles.mainImg} />
        </View>
    </SyncLayout>
)

export default SyncInfoStage
