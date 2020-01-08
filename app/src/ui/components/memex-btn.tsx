import React from 'react'
import {
    Text,
    View,
    TouchableOpacity,
    ButtonProps,
    StyleProp,
} from 'react-native'

import styles from './memex-btn.styles'
import LoadingBalls from './loading-balls'

export interface Props extends ButtonProps {
    style?: StyleProp<any>
    smallWidth?: boolean
    isLoading?: boolean
    secondary?: boolean
    warning?: boolean
    hidden?: boolean
    empty?: boolean
    __notReallyDisabled?: boolean
}

class MemexButton extends React.PureComponent<Props> {
    private calcMainStyles() {
        const isDisabled = this.calcIsDisabled()
        return [
            styles.button,
            this.props.smallWidth ? styles.buttonSmallWidth : null,
            this.props.secondary ? styles.buttonSecondary : null,
            isDisabled ? styles.buttonDisabled : null,
            this.props.secondary && isDisabled
                ? styles.buttonSecondaryDisabled
                : null,
            this.props.warning ? styles.buttonWarn : null,
            this.props.empty ? styles.buttonEmpty : null,
            this.props.style,
        ]
    }

    private calcIsDisabled(): boolean {
        if (this.props.__notReallyDisabled) {
            return false
        }

        return !!(this.props.disabled || this.props.isLoading)
    }

    private renderText() {
        if (this.props.isLoading) {
            return (
                <LoadingBalls
                    style={styles.loading}
                    ballStyle={styles.loadingBall}
                />
            )
        }

        return (
            <Text
                style={[
                    styles.text,
                    this.props.warning ? styles.textWarn : null,
                    this.props.empty ? styles.textEmpty : null,
                ]}
            >
                {this.props.title}
            </Text>
        )
    }

    render() {
        if (this.props.hidden) {
            return <View style={[styles.button, styles.buttonHidden]} />
        }

        return (
            <TouchableOpacity
                onPress={this.props.onPress}
                disabled={this.calcIsDisabled()}
                style={this.calcMainStyles()}
            >
                {this.renderText()}
            </TouchableOpacity>
        )
    }
}

export default MemexButton
