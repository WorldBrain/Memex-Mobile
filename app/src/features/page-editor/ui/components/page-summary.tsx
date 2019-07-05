import React from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    GestureResponderEvent,
} from 'react-native'

import PageBody, {
    Props as PageBodyProps,
} from 'src/features/overview/ui/components/result-page-body'
import styles from './page-summary.styles'

export interface Props extends PageBodyProps {
    onBackPress: (e: GestureResponderEvent) => void
}

const MainLayout: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <TouchableOpacity onPress={props.onBackPress}>
            <Image
                style={styles.backIcon}
                source={require('src/ui/img/arrow-prev.png')}
            />
        </TouchableOpacity>
        <View style={styles.pageBodyContainer}>
            <PageBody {...props} />
        </View>
    </View>
)

export default MainLayout
