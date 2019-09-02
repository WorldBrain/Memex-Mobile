import React from 'react'
import { View, Animated } from 'react-native'

import styles from './loading-balls.styles'

export interface Props {}

interface State {
    leftOffset: Animated.Value
    sizeInc: Animated.Value
    sizeDec: Animated.Value
}

class LoadingBalls extends React.PureComponent<Props, State> {
    static INIT_SIZE = 0
    static FINAL_SIZE = 15
    static INIT_SPACING = 0
    static FINAL_SPACING = 30
    static DURATION = 600

    state = {
        leftOffset: new Animated.Value(LoadingBalls.INIT_SPACING),
        sizeInc: new Animated.Value(LoadingBalls.INIT_SIZE),
        sizeDec: new Animated.Value(LoadingBalls.FINAL_SIZE),
    }

    componentDidMount() {
        Animated.loop(
            Animated.parallel([
                Animated.timing(this.state.leftOffset, {
                    toValue: LoadingBalls.FINAL_SPACING,
                    duration: LoadingBalls.DURATION,
                }),
                Animated.timing(this.state.sizeInc, {
                    toValue: LoadingBalls.FINAL_SIZE,
                    duration: LoadingBalls.DURATION,
                }),
                Animated.timing(this.state.sizeDec, {
                    toValue: LoadingBalls.INIT_SIZE,
                    duration: LoadingBalls.DURATION,
                }),
            ]),
        ).start()
    }

    render() {
        return (
            <View style={styles.container}>
                <Animated.View
                    style={{
                        ...styles.ball,
                        width: this.state.sizeInc,
                        height: this.state.sizeInc,
                        left: 0,
                    }}
                />
                <Animated.View
                    style={{
                        ...styles.ball,
                        left: Animated.add(0, this.state.leftOffset),
                    }}
                />
                <Animated.View
                    style={{
                        ...styles.ball,
                        left: Animated.add(30, this.state.leftOffset),
                    }}
                />
                <Animated.View
                    style={{
                        ...styles.ball,
                        width: this.state.sizeDec,
                        height: this.state.sizeDec,
                        left: 60,
                    }}
                />
            </View>
        )
    }
}

export default LoadingBalls
