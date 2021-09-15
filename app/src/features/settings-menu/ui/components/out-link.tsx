import React from 'react'
import { Text, View } from 'react-native'

import styles from './settings-link.styles'
import Link from 'src/ui/components/link'

export interface Props {
    skipBottomBorder?: boolean
    url: string
}

const OutLink: React.StatelessComponent<Props> = (props) => (
    <View
        style={[
            props.skipBottomBorder
                ? styles.containerNoBorder
                : styles.container,
        ]}
    >
        <Link href={props.url} style={styles.link}>
            {props.children}
        </Link>
    </View>
)

export default OutLink
