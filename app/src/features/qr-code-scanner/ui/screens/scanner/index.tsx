import React from 'react'
import { Text, View, Button } from 'react-native'

import { NavigationScreen } from 'src/ui/types'
import Logic, { State, Event } from './logic'
import Scanner from '../../components/scanner'

export interface Props {}

export default class ScannerScreen extends NavigationScreen<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private handleQRRead = (e: any) => {
        this.processEvent('setScannerOpen', { value: false })
        this.processEvent('setDataString', { value: e.data })
    }

    private handleOpenScanner = (e: any) => {
        this.processEvent('setScannerOpen', { value: true })
    }

    private handleReset = (e: any) => {
        this.processEvent('setScannerOpen', { value: false })
        this.processEvent('setDataString', { value: undefined })
    }

    private renderTopContent() {
        return (
            <Text>
                Point your camera at the QR code shown in the Memex extension's
                Sync page.
            </Text>
        )
    }

    private renderScanner() {
        return (
            <Scanner
                onQRRead={this.handleQRRead}
                topContent={this.renderTopContent()}
            />
        )
    }

    private renderOpenButton() {
        return (
            <View>
                <Button
                    title="Press to open scanner"
                    onPress={this.handleOpenScanner}
                />
            </View>
        )
    }

    private renderReadData() {
        return (
            <View>
                <Text>The following data was read:</Text>
                <Text>{this.state.readData}</Text>
                <Button title="Go back" onPress={this.handleReset} />
            </View>
        )
    }

    render() {
        if (this.state.isScannerOpen) {
            return this.renderScanner()
        }

        if (this.state.readData != null) {
            return this.renderReadData()
        }

        return this.renderOpenButton()
    }
}
