import React from 'react'
import { View, Text } from 'react-native'

import styles from './error-view.styles'
import Button from 'src/ui/components/memex-btn'

export interface Props {
    url: string
    message?: string
    className?: string | string[]
    alreadyReported: boolean
    onErrorReport: () => void
}

class ErrorView extends React.PureComponent<Props> {
    private get mainClass() {
        let custom: string[] = []

        if (this.props.className) {
            custom =
                typeof this.props.className === 'string'
                    ? [this.props.className]
                    : this.props.className
        }

        return [styles.container, ...custom]
    }

    private get buttonText() {
        return this.props.alreadyReported ? 'Reported!' : 'Report URL'
    }

    private renderMessage() {
        if (!this.props.message) {
            return
        }

        return (
            <>
                <Text>Error message:</Text>
                <Text style={styles.details}>{this.props.message}</Text>
            </>
        )
    }

    render() {
        return (
            <View style={this.mainClass}>
                <Text style={styles.details}>{this.props.url}</Text>
                <Text>
                    This URL has failed to be loaded in the annotation viewer
                </Text>
                {this.renderMessage()}
                <Button
                    title={this.buttonText}
                    onPress={this.props.onErrorReport}
                    disabled={this.props.alreadyReported}
                />
            </View>
        )
    }
}

export default ErrorView
