import React from 'react'
import { View } from 'react-native'

import MainLayout, { Props as MainLayoutProps } from 'src/ui/layouts/main'
import styles from './gif-layout.styles'

export interface Props extends MainLayoutProps {}

const GifLayout: React.StatelessComponent<Props> = props => (
    <MainLayout {...props}>
        <View style={styles.gif} />
    </MainLayout>
)

export default GifLayout
