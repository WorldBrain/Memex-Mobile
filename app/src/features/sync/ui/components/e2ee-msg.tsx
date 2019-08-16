import React from 'react'
import { Text } from 'react-native'

import Link from 'src/ui/components/link'
import styles from './e2ee-msg.styles'

export interface Props {}

const E2EEMessage: React.StatelessComponent<Props> = props => (
    <>
        <Text style={styles.basicText}>Your sync is End-2-End encrypted!</Text>
        <Link style={styles.basicText} href="https://google.com">
            What does that mean?
        </Link>
    </>
)

export default E2EEMessage
