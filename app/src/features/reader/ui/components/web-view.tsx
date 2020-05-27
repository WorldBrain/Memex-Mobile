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
                        uri: this.props.url,
                        // TODO: render given HTML rather than fetch URL contents
                        // html: this.props.htmlSource,
                        // baseUrl: this.props.url,
                    }}
                />
            </View>
        )
    }
}

export default ReaderWebView
