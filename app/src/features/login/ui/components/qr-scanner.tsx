import * as React from 'react'
import styled from 'styled-components/native'
import { Linking, StyleSheet } from 'react-native'
import { useCameraDevices } from 'react-native-vision-camera'
import { Camera } from 'react-native-vision-camera'
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner'
import type { UITaskState } from 'src/ui/types'

export interface Props {
    onQRCodeScan: (value: string) => void
}

export const QRCodeScanner: React.FunctionComponent<Props> = ({
    onQRCodeScan,
}) => {
    const [hasPermission, setHasPermission] = React.useState<boolean>(false)
    const [loadPermissionState, setLoadPermissionState] = React.useState<
        UITaskState
    >('pristine')
    const { back: device } = useCameraDevices()

    const [frameProcessor, barcodes] = useScanBarcodes(
        [BarcodeFormat.QR_CODE],
        {
            checkInverted: true,
        },
    )

    React.useEffect(() => {
        ;(async () => {
            setLoadPermissionState('running')
            const status = await Camera.requestCameraPermission()
            setHasPermission(status === 'authorized')
            setLoadPermissionState('done')
        })()
    }, [])

    if (loadPermissionState === 'running' || !device) {
        return null
    }

    if (!device || !hasPermission) {
        return (
            <ErrorMsgContainer
                onPress={() => {
                    Linking.openSettings()
                }}
            >
                <ErrorMsg>
                    Please give Memex permission to access the camera to scan
                    the login code
                </ErrorMsg>
            </ErrorMsgContainer>
        )
    }

    if (barcodes[0]?.rawValue) {
        onQRCodeScan(barcodes[0].rawValue)
    }

    return (
        <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            frameProcessor={frameProcessor}
            frameProcessorFps={5}
        />
    )
}

const ErrorMsgContainer = styled.TouchableOpacity``
const ErrorMsg = styled.Text``
const Barcode = styled.Text``
