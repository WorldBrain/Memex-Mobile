import React from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import Logic, { State, Event, Props } from './logic'
import { NavigationScreen } from 'src/ui/types'
import ActionBar from '../../components/action-bar'
import ReaderWebView from '../../components/web-view'
import styles from './styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import { RemoteFnName } from 'src/features/reader/utils/remote-functions'
import { Message as WebViewMessage } from 'src/content-script/types'

export default class Reader extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private webView!: WebView
    private _mockClick = () => undefined

    private runFnInWebView = (fnName: RemoteFnName) =>
        this.webView.injectJavaScript(
            `window['remoteFnEvents'].emit('${fnName}'); true;`,
        )

    private handleBackClick = () =>
        this.props.navigation.navigate({ routeName: 'Overview' })

    private handleWebViewMessageReceived = (serialized: string) => {
        let message: WebViewMessage
        try {
            message = JSON.parse(serialized)
        } catch (err) {
            throw new Error(
                `Received malformed message from WebView: ${serialized}`,
            )
        }

        switch (message.type) {
            case 'selection':
                return this.processEvent('setTextSelection', {
                    text: message.payload,
                })
            case 'highlight':
                return this.processEvent('createHighlight', {
                    anchor: message.payload,
                })
            case 'annotation':
                return this.processEvent('createAnnotation', {
                    anchor: message.payload,
                })
            default:
                console.warn(
                    'Unsupported message received from WebView:',
                    message,
                )
        }
    }

    private renderWebView() {
        if (this.state.loadState === 'running') {
            return (
                <View style={[styles.webView, styles.webViewLoader]}>
                    <LoadingBalls />
                </View>
            )
        }

        return (
            <ReaderWebView
                setRef={ref => (this.webView = ref)}
                url={this.state.url}
                className={styles.webView}
                htmlSource={this.state.htmlSource!}
                onMessage={this.handleWebViewMessageReceived}
            />
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderWebView()}
                <ActionBar
                    className={styles.actionBar}
                    {...this.state}
                    onBackBtnPress={this.handleBackClick}
                    onHighlightBtnPress={() =>
                        this.runFnInWebView('createHighlight')
                    }
                    onAnnotateBtnPress={() =>
                        this.runFnInWebView('createAnnotation')
                    }
                    onBookmarkBtnPress={() =>
                        this.processEvent('toggleBookmark', null)
                    }
                    onCommentBtnPress={this._mockClick}
                    onListBtnPress={this._mockClick}
                    onTagBtnPress={this._mockClick}
                />
            </View>
        )
    }
}
