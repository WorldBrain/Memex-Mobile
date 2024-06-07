import React from 'react'
import { View } from 'react-native'

import SyncLayout, { Props as MainLayoutProps } from 'src/ui/layouts/sync'
import styles from './gif-layout.styles'

export interface Props extends MainLayoutProps {}

const GifLayout: React.StatelessComponent<Props> = props => (
    <SyncLayout {...props}>
        <View style={styles.gif} />
    </SyncLayout>
)

export default GifLayout
