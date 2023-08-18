import * as React from 'react'
import styled from 'styled-components/native'
import { StyleSheet } from 'react-native'
import { useCameraDevices } from 'react-native-vision-camera'
import { Camera } from 'react-native-vision-camera'
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner'

export interface Props {}

export const QRCodeScanner: React.FunctionComponent<Props> = ({}) => {
    const [hasPermission, setHasPermission] = React.useState<boolean>(false)
    const devices = useCameraDevices()
    const device = devices.back

    const [frameProcessor, barcodes] = useScanBarcodes(
        [BarcodeFormat.QR_CODE],
        {
            checkInverted: true,
        },
    )

    React.useEffect(() => {
        ;(async () => {
            const status = await Camera.requestCameraPermission()
            setHasPermission(status === 'authorized')
        })()
    }, [])

    if (!device || !hasPermission) {
        return (
            <ErrorMsgContainer>
                <ErrorMsg>Cannot access the camera to scan QR code</ErrorMsg>
            </ErrorMsgContainer>
        )
    }

    return (
        <>
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                frameProcessor={frameProcessor}
                frameProcessorFps={5}
            />
            {barcodes.map((barcode, idx) => (
                <Barcode key={idx}>fsf: {barcode.displayValue}</Barcode>
            ))}
        </>
    )
}

const ErrorMsgContainer = styled.View``
const ErrorMsg = styled.Text``
const Barcode = styled.Text``
