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
import { Icon } from 'src/ui/components/icons/icon-mobile'

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

    private renderError = (
        errorDomain: string | undefined,
        errorCode: number,
        errorDesc: string,
    ) => {
        // Lack of SSL error case
        if (errorCode === -1023 || errorCode === -1200) {
            return (
                <ErrorScreen>
                    <SectionCircle size="60px">
                        <Icon
                            icon={icons.Lock}
                            heightAndWidth="20px"
                            color="purple"
                        />
                    </SectionCircle>
                    <Header>HTTP pages not supported</Header>
                    <ErrorMessage>
                        Please save and open a HTTPS version of this page
                    </ErrorMessage>
                </ErrorScreen>
            )
        }

        // Default error case
        return (
            <ErrorScreen>
                <SectionCircle size="60px">
                    <Icon
                        icon={icons.Alert}
                        heightAndWidth="20px"
                        color="purple"
                    />
                </SectionCircle>
                <Header>Error Loading Page</Header>
                <ErrorMessage>
                    The page could not be loaded because of an error:{'\n'}
                    {errorDesc}
                    {'\n'}({errorCode})
                </ErrorMessage>
                <Spacer10 />
                <Button
                    onPress={() =>
                        Linking.openURL(
                            `mailto:support@memex.garden?subject=Memex%20Go%3A%20Error%20Opening%20Link&body=Hey%20folks%2C%0D%0A%0D%0AI%20have%20an%20error%20opening%20a%20link%20in%20the%20mobile%20app.%0D%0AThe%20error%20message%20is%20${errorCode} and the url is ${this.state.url}.%0D%0A%0D%0AThanks%20for%20the%20help%0D%0A`,
                        )
                    }
                >
                    <ButtonText>Report</ButtonText>
                </Button>
            </ErrorScreen>
        )
    }

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
                    renderError={this.renderError}
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

const ErrorScreen = styled.View`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
`

const ErrorMessage = styled.Text`
    font-size: 18px;
    color: ${(props) => props.theme.colors.greyScale5};
    text-align: center;
    padding: 0px 20px;
`

const Header = styled.Text`
    font-size: 22px;
    font-weight: 800;
    color: ${(props) => props.theme.colors.greyScale6};
    margin-bottom: 10px;
`
const SectionCircle = styled.View<{ size: string }>`
    background: ${(props) => props.theme.colors.greyScale1};
    border-radius: 100px;
    height: ${(props) => (props.size ? props.size : '60px')};
    width: ${(props) => (props.size ? props.size : '60px')};
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
`

const Spacer10 = styled.View`
    height: 20px;
`

const Button = styled.TouchableOpacity`
    width: 100px;
    height: 40px;
    background: ${(props) => props.theme.colors.prime1};
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const ButtonText = styled.Text`
    font-weight: 500;
    font-size: 16px;
    color: white;
`
