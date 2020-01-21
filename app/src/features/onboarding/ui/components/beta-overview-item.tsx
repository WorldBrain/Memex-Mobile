import React from 'react'
import { View, Text } from 'react-native'

import TickBall from 'src/ui/components/tick-ball'
import styles from './beta-overview-item.styles'

export interface Props {
    headingText: string
    secondaryText?: string
    checked?: boolean
}

const BetaOverviewItem: React.StatelessComponent<Props> = props => (
    <View style={styles.mainContainer}>
        <TickBall disabled={!props.checked} style={styles.tickBall} />
        <View style={styles.textContainer}>
            <Text
                style={[
                    styles.headingText,
                    props.checked ? styles.textChecked : null,
                ]}
            >
                {props.headingText}
            </Text>
            {props.secondaryText && (
                <Text
                    style={[
                        styles.secondaryText,
                        props.checked ? styles.textChecked : null,
                    ]}
                >
                    {props.secondaryText}
                </Text>
            )}
        </View>
    </View>
)

export default BetaOverviewItem
