import React from 'react'
import QRCodeScanner, {
    Event as QRReadEvent,
} from 'react-native-qrcode-scanner'

import MainLayout from 'src/ui/components/main-layout'
import E2EEMessage from './e2ee-msg'
import styles from './sync-scan-qr-stage.styles'

export interface Props {
    onBtnPress: any // TODO: Remove this button; just used as simulators can't interact with camera
    onQRRead: (e: QRReadEvent) => void
}

const SyncScanQRStage: React.StatelessComponent<Props> = props => (
    <MainLayout
        titleText="Step 2"
        subtitleText="Scan the QR code displayed in your Memex"
        onBtnPress={props.onBtnPress}
        btnText="skip"
    >
        <QRCodeScanner
            cameraStyle={styles.cameraView as any}
            containerStyle={styles.cameraViewContainer as any}
            onRead={props.onQRRead}
        />
        <E2EEMessage />
    </MainLayout>
)

export default SyncScanQRStage
