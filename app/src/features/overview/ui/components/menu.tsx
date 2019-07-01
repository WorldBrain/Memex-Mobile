import React from 'react';
import { View, Text, TouchableHighlight } from "react-native";

import styles from './menu.styles'
import { ResultType } from '../../types'
import ResultSwitch from './result-type-switch'

export interface Props {
    selected: ResultType
    setResultType: (type: ResultType) => void
}

const Menu: React.StatelessComponent<Props> = props => (
    <View style={styles.mainContainer}>
        <View style={styles.topContainer}>
            <Text style={styles.collectionsText}>All Collections</Text>
            <Text>Menu</Text>
        </View>
        <View style={styles.bottomContainer}>
            <ResultSwitch type='pages' {...props}>Pages</ResultSwitch>
            <ResultSwitch type='notes' {...props}>Notes</ResultSwitch>
        </View>
    </View>
)

export default Menu
