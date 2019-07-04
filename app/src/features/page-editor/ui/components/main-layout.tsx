import React from 'react'
import { View, Text } from 'react-native'

import styles from './main-layout.styles'
import PageSummary, { Props as PageSummaryProps } from './page-summary'

export interface Props extends PageSummaryProps {}

const MainLayout: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <View style={styles.pageContainer}>
            <PageSummary {...props} />
        </View>
        <View style={styles.editorContainer}>{props.children}</View>
    </View>
)

export default MainLayout
