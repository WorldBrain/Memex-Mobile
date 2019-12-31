import React from 'react'
import QRCodeScanner, {
    Event as QRReadEvent,
} from 'react-native-qrcode-scanner'

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
    <SyncLayout
        titleText="Step 3"
        subtitleText="Scan the QR code"
        btnText="Next"
        disableMainBtn
        {...props}
    >
        <QRCodeScanner
            cameraStyle={styles.cameraView as any}
            containerStyle={styles.cameraViewContainer as any}
            onRead={onQRRead}
        />
        <E2EEMessage
            onPress={onQRRead as any} // TODO: Remove this; just offers a way for simulator to do a fake sync as camera isn't available
        />
        {debug && <ManualSyncInput {...props} />}
    </SyncLayout>
)

export default SyncScanQRStage
