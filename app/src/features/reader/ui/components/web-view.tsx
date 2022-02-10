import React from 'react'
import { View } from 'react-native'
import { WebView, WebViewProps } from 'react-native-webview'
import styled from 'styled-components/native'

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
            <Container style={[styles.container, this.props.className]}>
                <WebView
                    style={styles.webView}
                    source={{
                        uri: this.props.url,
                        // html: this.props.htmlSource,
                        // baseUrl: this.props.url,
                    }}
                    mediaPlaybackRequiresUserAction={true}
                    {...this.props}
                    ref={this.props.setRef}
                    onMessage={({ nativeEvent }) =>
                        this.props.onMessage(nativeEvent.data)
                    }
                />
            </Container>
        )
    }
}

export default ReaderWebView

const Container = styled.SafeAreaView``
