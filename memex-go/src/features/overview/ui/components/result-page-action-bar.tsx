import React from 'react'
import { View } from 'react-native'

import styles from './result-page-action-bar.styles'

export interface Props {
    renderLeftSection?: (style: any) => JSX.Element
}

const ResultPageActionBar: React.StatelessComponent<Props> = (props) => (
    <View>
        {/* {props.renderLeftSection
            ? props.renderLeftSection(styles.leftText)
            : null} */}
        <View>{props.children}</View>
    </View>
)

export default ResultPageActionBar
