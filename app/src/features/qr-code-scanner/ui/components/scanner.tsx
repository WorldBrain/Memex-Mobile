import React from 'react'
import { View } from 'react-native'
import QRCodeScanner, { Event } from 'react-native-qrcode-scanner'

export interface Props {
    topContent: JSX.Element
    onQRRead: (e: Event) => void
}

const Scanner: React.StatelessComponent<Props> = props => (
    <View>
        <QRCodeScanner onRead={props.onQRRead} topContent={props.topContent} />
    </View>
)

export default Scanner
