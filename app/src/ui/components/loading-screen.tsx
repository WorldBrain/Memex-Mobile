import React from 'react'
import { View } from 'react-native'

import LoadingBalls from './loading-balls'
import styles from './loading-screen.styles'

export default class LoadingScreen extends React.PureComponent {
    render() {
        return (
            <View style={styles.container}>
                <LoadingBalls />
            </View>
        )
    }
}
