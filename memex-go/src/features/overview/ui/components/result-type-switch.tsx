import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

import styles from './result-type-switch.styles'
import { Props as MenuProps } from './menu'
import { ResultType } from '../../types'

export interface Props extends MenuProps {
    type: ResultType
}

const ResultTypeSwitch: React.StatelessComponent<Props> = props => (
    <TouchableOpacity
        style={[
            styles.main,
            props.selected === props.type ? styles.active : null,
        ]}
    >
        <Text
            onPress={() => props.setResultType(props.type)}
            style={styles.text}
        >
            {props.children}
        </Text>
    </TouchableOpacity>
)

export default ResultTypeSwitch
