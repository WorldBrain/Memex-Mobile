import React from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import styles from './web-view.styles'

export interface Props {
    url: string
    htmlSource: string
    className?: string
    onMessage: (data: string) => void
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
                    onMessage={({ nativeEvent }) =>
                        this.props.onMessage(nativeEvent.data)
                    }
                    // This flag needs to be set to afford text selection on iOS.
                    //   https://github.com/react-native-community/react-native-webview/issues/1275
                    allowsLinkPreview
                />
            </View>
        )
    }
}

export default ReaderWebView
