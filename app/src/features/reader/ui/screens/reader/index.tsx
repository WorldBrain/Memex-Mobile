import React from 'react'
import { Linking, Dimensions } from 'react-native'
import { WebView, WebViewNavigation } from 'react-native-webview'

import Logic, { State, Event, Props } from './logic'
import { StatefulUIElement } from 'src/ui/types'
import ActionBar, {
    heightLandscape as actionBarHeightLandscape,
    heightPortrait as actionBarHeightPortrait,
} from '../../components/action-bar'
import ErrorView from '../../components/error-view'
import LoadingBalls from 'src/ui/components/loading-balls'
import { RemoteFnName } from 'src/features/reader/utils/remote-functions'
import { Message as WebViewMessage } from 'src/content-script/types'
import Navigation, {
    height as navigationBarHeight,
} from 'src/features/overview/ui/components/navigation'
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
        <WebViewContainer
            isLandscape={this.state.rotation === 'landscape'}
            isLoading
        >
            <LoadingBalls />
        </WebViewContainer>
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
                    onErrorReport={() => this.processEvent('reportError', null)}
                />
            )
        }

        // TODO: sort out the type error here :S
        return (
            <WebViewContainer isLandscape={this.state.rotation === 'landscape'}>
                <WebView
                    source={{
                        uri: this.state.url,
                        // html: this.props.htmlSource,
                        // baseUrl: this.props.url,
                    }}
                    htmlSource={this.state.htmlSource!}
                    injectedJavaScript={this.generateInitialJSToInject()}
                    onNavigationStateChange={this.handleNavStateChange}
                    startInLoadingState
                    // This flag needs to be set to afford text selection on iOS.
                    //   https://github.com/react-native-community/react-native-webview/issues/1275
                    allowsLinkPreview
                    renderLoading={this.renderLoading}
                    mediaPlaybackRequiresUserAction
                    ref={(ref) => (this.webView = ref!)}
                    onMessage={({ nativeEvent }) => {
                        this.handleWebViewMessageReceived(nativeEvent.data)
                    }}
                    menuItems={[
                        { label: 'Highlight', key: 'highlight' },
                        { label: 'Add Note', key: 'annotate' },
                    ]}
                    onCustomMenuSelection={(webViewEvent) => {
                        if (
                            (webViewEvent.nativeEvent as any).key ===
                            'highlight'
                        ) {
                            this.runFnInWebView('createHighlight')
                        }
                        if (
                            (webViewEvent.nativeEvent as any).key === 'annotate'
                        ) {
                            this.runFnInWebView('createAnnotation')
                        }
                    }}
                />
            </WebViewContainer>
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
                    rightIcon={icons.ExternalLink}
                    rightIconSize="20px"
                    rightIconStrokeWidth="2px"
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
    align-items: center;
`

const WebViewContainer = styled.SafeAreaView<{
    isLandscape?: boolean
    isLoading?: boolean
}>`
    width: 100%;
    height: ${(props) =>
        Dimensions.get('window').height -
        navigationBarHeight -
        (props.isLandscape
            ? actionBarHeightLandscape - 60
            : actionBarHeightPortrait)}px;
    ${(props) =>
        props.isLoading
            ? `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    `
            : ''}
`
