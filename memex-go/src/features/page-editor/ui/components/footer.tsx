import React from 'react'
import { Text, View } from 'react-native'

import styles from './footer.styles'

export interface Props {}

const Footer: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <Text style={styles.mainText}>{props.children}</Text>
    </View>
)

export default Footer
