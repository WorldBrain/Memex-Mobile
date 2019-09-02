import React from 'react'
import { View } from 'react-native'

import styles from './progress-balls.styles'

export interface Props {
    count?: number
    selectedIndex?: number
}

const ProgressBalls: React.StatelessComponent<Props> = ({
    count = 3,
    selectedIndex,
}) => (
    <View style={styles.container}>
        {[...Array(count)].map((_, i) => (
            <View
                key={i}
                style={[
                    styles.ball,
                    selectedIndex === i ? styles.ballSelected : null,
                ]}
            />
        ))}
    </View>
)

export default ProgressBalls
