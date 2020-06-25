import React from 'react'
import { View, Text } from 'react-native'

import styles from './error-view.styles'
import Button from 'src/ui/components/memex-btn'

export interface Props {
    url: string
    message?: string
    className?: string | string[]
    onBackPress: () => void
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
                <Text>
                    The reader encountered an error loading the page from URL:
                </Text>
                <Text style={styles.details}>{this.props.url}</Text>
                {this.renderMessage()}
                <Button
                    title="Report URL"
                    onPress={this.props.onErrorReport}
                    warning
                />
                <Button title="Go back" onPress={this.props.onBackPress} />
            </View>
        )
    }
}

export default ErrorView
