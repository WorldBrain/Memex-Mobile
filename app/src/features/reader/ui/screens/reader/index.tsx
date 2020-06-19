import React from 'react'
import { View, Linking } from 'react-native'
import { WebView, WebViewNavigation } from 'react-native-webview'

import Logic, { State, Event, Props } from './logic'
import { NavigationScreen } from 'src/ui/types'
import { NAV_PARAMS } from 'src/ui/navigation/constants'
import ActionBar from '../../components/action-bar'
import ReaderWebView from '../../components/web-view'
import ErrorView from '../../components/error-view'
import styles from './styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import { RemoteFnName } from 'src/features/reader/utils/remote-functions'
import { Message as WebViewMessage, Anchor } from 'src/content-script/types'
import { EditorMode } from 'src/features/page-editor/types'
import { PageEditorNavigationParams } from 'src/features/page-editor/ui/screens/page-editor/types'

export default class Reader extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private webView!: WebView

    private constructJsRemoteFnCall = (
        fnName: RemoteFnName,
        arg?: any,
    ): string => {
        const serializedArg = JSON.stringify(arg)
        return !arg
            ? `window['remoteFnEvents'].emit('${fnName}'); true;`
            : `window['remoteFnEvents'].emit('${fnName}', ${serializedArg}); true;`
    }

    private runFnInWebView = (fnName: RemoteFnName, arg?: any) =>
        this.webView.injectJavaScript(this.constructJsRemoteFnCall(fnName, arg))

    private handleBackClick = () =>
        this.props.navigation.navigate({ routeName: 'Overview' })

    private setupNavToPageEditor = (mode: EditorMode) => () =>
        this.props.navigation.navigate('PageEditor', {
            [NAV_PARAMS.PAGE_EDITOR]: {
                previousRoute: 'Reader',
                pageUrl: this.state.url,
                mode,
            } as PageEditorNavigationParams,
        })

    private async createHighlightThenRender(anchor: Anchor) {
        await this.processEvent('createHighlight', { anchor })

        const latestIndex = this.state.highlights.length - 1

        this.runFnInWebView(
            'renderHighlight',
            this.state.highlights[latestIndex],
        )
    }

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
                return this.createHighlightThenRender(message.payload)
            case 'annotation':
                return this.processEvent('createAnnotation', {
                    anchor: message.payload,
                })
            case 'highlightClicked':
                return this.processEvent('editHighlight', {
                    highlightUrl: message.payload,
                })
            default:
                console.warn(
                    'Unsupported message received from WebView:',
                    message,
                )
        }
    }

    private handleOpenLinksInBrowser = (event: WebViewNavigation) => {
        if (
            event.navigationType !== 'click' ||
            Logic.formUrl(event.url) === this.state.url
        ) {
            return
        }

        this.webView.stopLoading()
        return Linking.openURL(event.url)
    }

    private generateInitialJSToInject() {
        const renderHighlightsCall = this.constructJsRemoteFnCall(
            'renderHighlights',
            this.state.highlights,
        )

        // TODO: We only need to inject `this.state.contentScriptSource` if full webpage mode -
        //   else we include it with the HTML we pass to the WebView for rendering.
        return `${this.state.contentScriptSource}; ${renderHighlightsCall}`
    }

    private renderLoading = () => (
        <View style={[styles.webView, styles.webViewLoader]}>
            <LoadingBalls />
        </View>
    )

    private renderWebView() {
        if (this.state.loadState === 'running') {
            return this.renderLoading()
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
                url={this.state.url}
                setRef={ref => (this.webView = ref)}
                className={styles.webView}
                onMessage={this.handleWebViewMessageReceived}
                htmlSource={this.state.htmlSource!}
                injectedJavaScript={this.generateInitialJSToInject()}
                onNavigationStateChange={this.handleOpenLinksInBrowser}
                startInLoadingState
                renderLoading={this.renderLoading}
                // This flag needs to be set to afford text selection on iOS.
                //   https://github.com/react-native-community/react-native-webview/issues/1275
                allowsLinkPreview
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
                    onListBtnPress={this.setupNavToPageEditor('collections')}
                    onCommentBtnPress={this.setupNavToPageEditor('notes')}
                    onTagBtnPress={this.setupNavToPageEditor('tags')}
                />
            </View>
        )
    }
}
