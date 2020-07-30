import React from 'react'
import QRCodeScanner, {
    Event as QRReadEvent,
} from 'react-native-qrcode-scanner'
import { Text, View } from 'react-native'

import SyncLayout from 'src/ui/layouts/sync'
import E2EEMessage from './e2ee-msg'
import styles from './sync-scan-qr-stage.styles'
import ManualSyncInput, {
    Props as ManualSyncInputProps,
} from './manual-sync-input'

export interface Props extends ManualSyncInputProps {
    onBtnPress?: (e: any) => void
    onCancelBtnPress: (e: any) => void
    onQRRead: (e: QRReadEvent) => void
    debug?: boolean
}

const SyncScanQRStage: React.StatelessComponent<Props> = ({
    onQRRead,
    debug,
    ...props
}) => (
    <SyncLayout titleText="Step 3" btnText="Next" disableMainBtn {...props}>
        <Text style={styles.instructionText}>Scan the QR code</Text>
        <View style={styles.outsideCameraContainer}>
            <QRCodeScanner
                cameraStyle={styles.cameraView as any}
                containerStyle={styles.cameraViewContainer as any}
                onRead={onQRRead}
            />
        </View>
        <E2EEMessage />
        {debug && <ManualSyncInput {...props} />}
    </SyncLayout>
)

export default SyncScanQRStage
