import React from 'react';
import { View, Image, Text, ImageSourcePropType } from "react-native";

import styles from './result-page-body.styles'

export interface Props {
    favIcon: ImageSourcePropType
    titleText: string
    pageUrl: string
}

const ResultPageBody: React.StatelessComponent<Props> = props => (
    <>
        <View style={styles.title}>
            <Image style={styles.favIcon} source={props.favIcon} />
            <Text style={styles.titleText}>{props.titleText}</Text>
        </View>
        <Text style={styles.link}>{props.pageUrl}</Text>
    </>
)

export default ResultPageBody
