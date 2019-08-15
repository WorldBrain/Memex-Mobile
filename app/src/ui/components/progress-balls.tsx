import React from 'react'
import { View } from 'react-native'

import styles from './loading-balls.styles'

export interface Props {
    count?: number
    selectedIndex?: number
}

const MainLayout: React.StatelessComponent<Props> = ({
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

export default MainLayout
