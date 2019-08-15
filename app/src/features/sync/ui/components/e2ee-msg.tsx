import React from 'react'
import { Text } from 'react-native'

import styles from './e2ee-msg.styles'

export interface Props {}

const E2EEMessage: React.StatelessComponent<Props> = props => (
    <>
        <Text style={styles.basicText}>Your sync is End-2-End encrypted!</Text>
        <Text style={[styles.basicText, styles.textLink]}>
            What does that mean?
        </Text>
    </>
)

export default E2EEMessage
