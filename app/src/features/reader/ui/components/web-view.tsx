import React from 'react'
import { View } from 'react-native'
import { WebView, WebViewProps } from 'react-native-webview'

import styles from './web-view.styles'

export interface Props extends Omit<WebViewProps, 'onMessage'> {
    url: string
    htmlSource: string
    className?: string
    onMessage: (data: string) => void
    setRef?: (webView: WebView) => void
}

class ReaderWebView extends React.PureComponent<Props> {
    render() {
        return (
            <View style={[styles.container, this.props.className]}>
                <WebView
                    style={styles.webView}
                    source={{
                        uri: this.props.url,
                        // html: this.props.htmlSource,
                        // baseUrl: this.props.url,
                    }}
                    {...this.props}
                    ref={this.props.setRef}
                    onMessage={({ nativeEvent }) =>
                        this.props.onMessage(nativeEvent.data)
                    }
                />
            </View>
        )
    }
}

export default ReaderWebView
