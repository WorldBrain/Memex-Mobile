import React from 'react';
import { View } from "react-native";

import styles from './result-container.styles'

export interface Props {
    renderFooter: () => JSX.Element
}

const Result: React.StatelessComponent<Props> = props => (
    <View style={styles.result}>
        {props.children}
        {props.renderFooter()}
    </View>
)

export default Result
