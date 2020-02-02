import React from 'react'
import {
    NativeSyntheticEvent,
    NativeTouchEvent,
    Text,
    View,
    Image,
} from 'react-native'

import styles from './sync-setup-stage.styles'
import SyncLayout from 'src/ui/layouts/sync'

export interface Props {
    onBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
    onCancelBtnPress: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const SyncInfoStage: React.StatelessComponent<Props> = props => (
    <SyncLayout titleText="Step 2" btnText="Next" {...props}>
        <Text style={styles.instructionText}>
            <Text style={styles.boldText}>Login </Text>
            on your Memex browser extension and go to {'\n'}
            <Text style={styles.boldText}>
                {' '}
                Settings ▸ Sync ▸ Pair New Devive{' '}
            </Text>
        </Text>
        <View style={styles.mainImgContainer}>
            <Image
                resizeMode="contain"
                style={styles.mainImg}
                source={require('../assets/sync-ext.png')}
            />
        </View>
    </SyncLayout>
)

export default SyncInfoStage
