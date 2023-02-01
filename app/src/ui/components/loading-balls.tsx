import React, { Component } from 'react'
import {
    BallIndicator,
    BarIndicator,
    DotIndicator,
    MaterialIndicator,
    PacmanIndicator,
    PulseIndicator,
    SkypeIndicator,
    UIActivityIndicator,
    WaveIndicator,
} from 'react-native-indicators'

import { theme } from 'src/ui/components/theme/theme'

export type Props = {
    size?: number
}

export const LoadingIndicator: React.StatelessComponent<Props> = (props) => {
    return <MaterialIndicator size={props.size} color={theme.colors.prime1} />
}

export default LoadingIndicator

// import React from 'react'
// import { View, Animated, StyleProp } from 'react-native'

// import styles from './loading-balls.styles'

// export interface Props {
//     style?: StyleProp<any>
//     ballStyle?: StyleProp<any>
// }

// interface State {
//     leftOffset: Animated.Value
//     sizeInc: Animated.Value
//     sizeDec: Animated.Value
// }

// class LoadingBalls extends React.PureComponent<Props, State> {
//     static INIT_SIZE = 0
//     static FINAL_SIZE = 15
//     static INIT_SPACING = 0
//     static FINAL_SPACING = 30
//     static DURATION = 600

//     state = {
//         leftOffset: new Animated.Value(LoadingBalls.INIT_SPACING),
//         sizeInc: new Animated.Value(LoadingBalls.INIT_SIZE),
//         sizeDec: new Animated.Value(LoadingBalls.FINAL_SIZE),
//     }

//     componentDidMount() {
//         Animated.loop(
//             Animated.parallel([
//                 Animated.timing(this.state.leftOffset, {
//                     toValue: LoadingBalls.FINAL_SPACING,
//                     duration: LoadingBalls.DURATION,
//                 }),
//                 Animated.timing(this.state.sizeInc, {
//                     toValue: LoadingBalls.FINAL_SIZE,
//                     duration: LoadingBalls.DURATION,
//                 }),
//                 Animated.timing(this.state.sizeDec, {
//                     toValue: LoadingBalls.INIT_SIZE,
//                     duration: LoadingBalls.DURATION,
//                 }),
//             ]),
//         ).start()
//     }

//     render() {
//         return (
//             <View style={[styles.container, this.props.style]}>
//                 <Animated.View
//                     style={{
//                         ...styles.ball,
//                         width: this.state.sizeInc,
//                         height: this.state.sizeInc,
//                         left: 0,
//                         ...this.props.ballStyle,
//                     }}
//                 />
//                 <Animated.View
//                     style={{
//                         ...styles.ball,
//                         left: Animated.add(0, this.state.leftOffset),
//                         ...this.props.ballStyle,
//                     }}
//                 />
//                 <Animated.View
//                     style={{
//                         ...styles.ball,
//                         left: Animated.add(30, this.state.leftOffset),
//                         ...this.props.ballStyle,
//                     }}
//                 />
//                 <Animated.View
//                     style={{
//                         ...styles.ball,
//                         width: this.state.sizeDec,
//                         height: this.state.sizeDec,
//                         left: 60,
//                         ...this.props.ballStyle,
//                     }}
//                 />
//             </View>
//         )
//     }
// }

// export default LoadingBalls
