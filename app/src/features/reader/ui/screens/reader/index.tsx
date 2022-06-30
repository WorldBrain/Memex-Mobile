import React from 'react'
import { View, Linking } from 'react-native'
import { WebView, WebViewNavigation } from 'react-native-webview'

import Logic, { State, Event, Props } from './logic'
import { StatefulUIElement } from 'src/ui/types'
import ActionBar from '../../components/action-bar'
import ReaderWebView from '../../components/web-view'
import ErrorView from '../../components/error-view'
import styles from './styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import { RemoteFnName } from 'src/features/reader/utils/remote-functions'
import { Message as WebViewMessage, Anchor } from 'src/content-script/types'
import Navigation from 'src/features/overview/ui/components/navigation'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'

export default class Reader extends StatefulUIElement<Props, State, Event> {
    constructor(props: Props) {
        super(props, new Logic(props))
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
                    renderHighlight: (h) =>
                        this.runFnInWebView('renderHighlight', h),
                })
            case 'annotation':
                return this.processEvent('createAnnotation', {
                    anchor: message.payload,
                    renderHighlight: (h) =>
                        this.runFnInWebView('renderHighlight', h),
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

    private handleNavStateChange = (event: WebViewNavigation) => {
        switch (event.navigationType) {
            case 'click':
                return this.handleOpenLinksInBrowser(event.url)
            case 'backforward':
            case 'formresubmit':
            case 'formsubmit':
            case 'reload':
                return this.webView.stopLoading()
            default:
        }
    }

    private handleOpenLinksInBrowser(url: string) {
        if (Logic.formUrl(url) === this.state.url) {
            return
        }

        this.webView.stopLoading()
        return Linking.openURL(url)
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

        if (this.state.error) {
            return (
                <ErrorView
                    url={this.state.url}
                    message={this.state.error.message}
                    alreadyReported={this.state.isErrorReported}
                    className={[styles.webView, styles.container]}
                    onErrorReport={() => this.processEvent('reportError', null)}
                />
            )
        }

        return (
            <ReaderWebView
                url={this.state.url}
                setRef={(ref) => (this.webView = ref)}
                className={styles.webView}
                onMessage={this.handleWebViewMessageReceived}
                htmlSource={this.state.htmlSource!}
                injectedJavaScript={this.generateInitialJSToInject()}
                onNavigationStateChange={this.handleNavStateChange}
                startInLoadingState
                renderLoading={this.renderLoading}
                // This flag needs to be set to afford text selection on iOS.
                //   https://github.com/react-native-community/react-native-webview/issues/1275
                allowsLinkPreview
                onHighlightBtnPress={() =>
                    this.runFnInWebView('createHighlight')
                }
                onAnnotateBtnPress={() =>
                    this.runFnInWebView('createAnnotation')
                }
            />
        )
    }

    render() {
        return (
            <Container>
                <Navigation
                    leftBtnPress={() => this.processEvent('goBack', null)}
                    leftIcon={icons.BackArrow}
                    leftIconSize="30px"
                    leftIconStrokeWidth="5px"
                    titleText={'Annotate this page'}
                    rightBtnPress={() => Linking.openURL(this.state.url)}
                    rightIcon={icons.Globe}
                    rightIconSize="20px"
                    rightIconStrokeWidth="5px"
                />
                {this.renderWebView()}
                <ActionBar
                    isErrorView={this.state.error != null}
                    {...this.state}
                    onBackBtnPress={() => this.processEvent('goBack', null)}
                    onHighlightBtnPress={() =>
                        this.runFnInWebView('createHighlight')
                    }
                    onAnnotateBtnPress={() =>
                        this.runFnInWebView('createAnnotation')
                    }
                    onBookmarkBtnPress={() =>
                        this.processEvent('toggleBookmark', null)
                    }
                    onListBtnPress={() =>
                        this.processEvent('navToPageEditor', {
                            mode: 'collections',
                        })
                    }
                    onCommentBtnPress={() =>
                        this.processEvent('navToPageEditor', { mode: 'notes' })
                    }
                    spaceCount={this.state.spaces.length}
                />
            </Container>
        )
    }
}

const Container = styled.SafeAreaView`
    height: 50%;
    display: flex;
`
