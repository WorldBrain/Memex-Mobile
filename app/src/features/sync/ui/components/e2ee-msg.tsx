import React from 'react'
import { Text } from 'react-native'

import Link from 'src/ui/components/link'
import styles from './e2ee-msg.styles'

export interface Props {
    onPress?: () => Promise<void>
}

const E2EEMessage: React.StatelessComponent<Props> = props => (
    <>
        <Text style={styles.basicText}>
            Your sync is End-2-End encrypted! {'\n'} We can never read any of
            your data
        </Text>
        <Link
            style={styles.basicText}
            href="https://en.wikipedia.org/wiki/End-to-end_encryption"
            onPress={props.onPress}
        >
            What does that mean?
        </Link>
    </>
)

export default E2EEMessage
