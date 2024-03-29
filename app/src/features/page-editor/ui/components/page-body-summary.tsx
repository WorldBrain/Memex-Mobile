import React from 'react'
import {
    View,
    Image,
    Text,
    TouchableWithoutFeedback,
    Linking,
} from 'react-native'

import styles from './page-body-summary.styles'

export interface Props {
    favIcon?: string
    titleText: string
    pageUrl: string
    domain: string
    fullUrl: string
    date: string
}

const ResultPageBody: React.StatelessComponent<Props> = (props) => (
    <>
        <TouchableWithoutFeedback
            onPress={() => Linking.openURL(props.fullUrl)}
        >
            <View style={styles.contentBox}>
                <View style={styles.title}>
                    {props.favIcon && (
                        <Image
                            style={styles.favIcon}
                            source={{ uri: props.favIcon }}
                        />
                    )}
                    <Text style={styles.titleText}>{props.titleText}</Text>
                </View>
                <Text style={styles.linkText}>{props.domain}</Text>
            </View>
        </TouchableWithoutFeedback>
    </>
)

export default ResultPageBody
