import React from 'react'
import {
    NativeSyntheticEvent,
    NativeTouchEvent,
    Text,
    View,
    Image,
} from 'react-native'

import styles from './sync-setup-stage.styles'
import sharedStyles from './shared.styles'
import SyncLayout from 'src/ui/layouts/sync'

export interface Props {
    onBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
    onCancelBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const SyncSetupStage: React.StatelessComponent<Props> = props => (
    <SyncLayout btnText="OK, got it!" titleText="STEP 1" {...props}>
        <Text style={styles.instructionText}>
            You need to be{' '}
            <Text style={{ fontWeight: 'bold' }}>
                on the same wifi connection
            </Text>{' '}
            with the devices you are trying to pair
        </Text>
        <View style={styles.mainImgContainer}>
            <Image
                resizeMode="contain"
                style={styles.mainImg}
                source={require('../assets/device-pair.png')}
            />
        </View>
    </SyncLayout>
)

export default SyncSetupStage
