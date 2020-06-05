import React from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import Logic, { State, Event, Props } from './logic'
import { NavigationScreen } from 'src/ui/types'
import { NAV_PARAMS } from 'src/ui/navigation/constants'
import ActionBar from '../../components/action-bar'
import ReaderWebView from '../../components/web-view'
import ErrorView from '../../components/error-view'
import styles from './styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import { RemoteFnName } from 'src/features/reader/utils/remote-functions'
import { Message as WebViewMessage } from 'src/content-script/types'
import { EditorMode } from 'src/features/page-editor/types'
import { PageEditorNavigationParams } from 'src/features/page-editor/ui/screens/page-editor/types'

export default class Reader extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private webView!: WebView
    private _mockClick = () => undefined

    private constructJs = (
        fnName: RemoteFnName,
        serializedArg?: string,
    ): string => {
        return !serializedArg
            ? `window['remoteFnEvents'].emit('${fnName}'); true;`
            : `window['remoteFnEvents'].emit('${fnName}', ${serializedArg}); true;`
    }

    private runFnInWebView = (fnName: RemoteFnName, serializedArg?: string) =>
        this.webView.injectJavaScript(this.constructJs(fnName, serializedArg))

    private handleBackClick = () =>
        this.props.navigation.navigate({ routeName: 'Overview' })

    private setupNaToPageEditor = (mode: EditorMode) => () =>
        this.props.navigation.navigate('PageEditor', {
            [NAV_PARAMS.PAGE_EDITOR]: {
                previousRoute: 'Reader',
                pageUrl: this.state.url,
                mode,
            } as PageEditorNavigationParams,
        })

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

        if (this.state.errorMessage) {
            return (
                <ErrorView
                    className={styles.webView}
                    message={this.state.errorMessage}
                />
            )
        }

        return (
            <ReaderWebView
                setRef={ref => (this.webView = ref)}
                url={this.state.url}
                className={styles.webView}
                htmlSource={this.state.htmlSource!}
                onMessage={this.handleWebViewMessageReceived}
                injectedJavaScript={this.constructJs(
                    'renderHighlights',
                    JSON.stringify(this.state.annotationAnchors),
                )}
            />
        )
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderWebView()}
                <ActionBar
                    className={styles.actionBar}
                    isErrorView={this.state.errorMessage != null}
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
                    onListBtnPress={this.setupNaToPageEditor('collections')}
                    onCommentBtnPress={this.setupNaToPageEditor('notes')}
                    onTagBtnPress={this.setupNaToPageEditor('tags')}
                />
            </View>
        )
    }
}
