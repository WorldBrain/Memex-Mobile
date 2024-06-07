import React from 'react'
import { View, Text, FlatList } from 'react-native'

import EmptyLayout from 'src/ui/layouts/empty'
import Button from 'src/ui/components/memex-btn'
import Logic, { State, Event, LogType } from './logic'
import { MainNavProps, UIServices, StatefulUIElement } from 'src/ui/types'
import styles from './styles'
import { LogEntry, DebugConsole } from 'src/utils/debug-console'

interface Props extends MainNavProps<'DebugConsole'> {
    services: UIServices<'localStorage'>
}

export default class DebugConsoleScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, new Logic())
    }

    private initSetLogType = (type: LogType) => () =>
        this.processEvent('setLogType', { type })

    private handleBackPress = () => this.props.navigation.goBack()

    private handleClearPress = () => {
        switch (this.state.logType) {
            case 'error':
                ;(console as any).clearError()
                break
            case 'warn':
                ;(console as any).clearWarn()
                break
            case 'out':
            default:
                ;(console as any).clearLog()
        }

        this.processEvent('refreshState', {})
    }

    private renderLogEntries() {
        const getEntries = (debugConsole: DebugConsole): LogEntry[] => {
            switch (this.state.logType) {
                case 'out':
                    return debugConsole.outLogEntries
                case 'warn':
                    return debugConsole.warnLogEntries
                case 'error':
                default:
                    return debugConsole.errorLogEntries
            }
        }

        return (
            <FlatList
                data={getEntries(console as any)}
                renderItem={({ item: [datestamp, message], index }) => (
                    <View key={index} style={styles.logEntry}>
                        <Text style={styles.logEntryDate} selectable>
                            {datestamp.toTimeString()}
                        </Text>
                        <Text style={styles.logEntryText} selectable>
                            {message}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.emptyList}>
                        Cleared at {this.state.refreshedAt.toISOString()}
                    </Text>
                }
            />
        )
    }

    render() {
        return (
            <EmptyLayout>
                <View style={styles.mainContent}>
                    <View style={styles.logContainer}>
                        {this.renderLogEntries()}
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Standard"
                            onPress={this.initSetLogType('out')}
                        />
                        <Button
                            title="Warnings"
                            onPress={this.initSetLogType('warn')}
                        />
                        <Button
                            title="Errors"
                            onPress={this.initSetLogType('error')}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <Button title="Back" onPress={this.handleBackPress} />
                        <Button title="Clear" onPress={this.handleClearPress} />
                    </View>
                </View>
            </EmptyLayout>
        )
    }
}
