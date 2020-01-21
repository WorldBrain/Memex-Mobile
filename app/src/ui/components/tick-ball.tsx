import React from 'react'
import { View, Text, StyleProp } from 'react-native'

import Tick from 'src/ui/assets/tick.svg'
import styles from './tick-ball.styles'

export interface Props {
    disabled?: boolean
    style?: StyleProp<any>
}

const TickBall: React.StatelessComponent<Props> = props => (
    <View
        style={[
            styles.checkCircle,
            props.disabled ? styles.checkCircleDisabled : null,
            props.style,
        ]}
    >
        {!props.disabled && <Tick style={styles.tick} />}
    </View>
)

export default TickBall
