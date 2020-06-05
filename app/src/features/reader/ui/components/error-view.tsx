import React from 'react'
import { View, Text } from 'react-native'

import styles from './error-view.styles'

export interface Props {
    message?: string
    className?: string
}

class ErrorView extends React.PureComponent<Props> {
    render() {
        return (
            <View style={[styles.container, this.props.className]}>
                <Text>An error happened</Text>
                {this.props.message && <Text>{this.props.message}</Text>}
            </View>
        )
    }
}

export default ErrorView
