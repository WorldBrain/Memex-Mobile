import React from 'react'
import { View } from 'react-native'

import styles from './empty.styles'

export interface Props {
    style?: any
}

const EmptyLayout: React.StatelessComponent<Props> = ({
    style = {},
    ...props
}) => <View style={[style, styles.container]}>{props.children}</View>

export default EmptyLayout
