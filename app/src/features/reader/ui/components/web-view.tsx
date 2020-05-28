import React from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import styles from './web-view.styles'

export interface Props {
    className?: string
    url: string
    htmlSource: string
}

class ReaderWebView extends React.PureComponent<Props> {
    render() {
        return (
            <View style={[styles.container, this.props.className]}>
                <WebView
                    style={styles.webView}
                    source={{
                        html: this.props.htmlSource,
                        baseUrl: this.props.url,
                    }}
                />
            </View>
        )
    }
}

export default ReaderWebView
