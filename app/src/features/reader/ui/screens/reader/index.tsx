import React from 'react'
import {
    Linking,
    Dimensions,
    StyleSheet,
    View,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native'
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
import styled, { css } from 'styled-components/native'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import { TouchableOpacity, Text } from 'react-native'
import Markdown from 'react-native-markdown-display'
import SplitPane from './splitPane'
import { getBaseTextHighlightStyles } from '@worldbrain/memex-common/lib/in-page-ui/highlighting/highlight-styles'
import { isUrlYTVideo } from '@worldbrain/memex-common/lib/utils/youtube-url'

const ActionBarHeight = 60
export default class Reader extends StatefulUIElement<Props, State, Event> {
    constructor(props: Props) {
        super(props, new Logic(props))
    }

    onChangeSliderValue = (value, finish) => {
        try {
            if (finish === true) {
                this.processEvent('updateDisplaySplitHeight', value)
            }
        } catch (e) {
            console.log(e)
        }
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
        // Errors need to be doubly parsed
        if (message.type === 'error') {
            message.payload = new Error(JSON.parse(message.payload as any))
        }

        switch (message.type) {
            case 'selection':
                return this.processEvent('setTextSelection', {
                    text: message.payload,
                })
            case 'highlight':
                return this.processEvent('createHighlight', {
                    anchor: message.payload.anchor ?? null,
                    videoTimestamp: message.payload.videoTimestamp,
                    renderHighlight: (h) =>
                        this.runFnInWebView('renderHighlight', h),
                })
            case 'annotation':
                return this.processEvent('createAnnotation', {
                    anchor: message.payload.anchor ?? null,
                    videoTimestamp: message.payload.videoTimestamp,
                    renderHighlight: (h) =>
                        this.runFnInWebView('renderHighlight', h),
                })
            case 'highlightClicked':
                return this.processEvent('editHighlight', {
                    highlightUrl: message.payload,
                })
            case 'debug':
                console.log('WebView debug:', message.payload)
            case 'error':
                return this.processEvent('reportError', {
                    error: message.payload,
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
        <LoadingContainer
            deviceOrientation={
                this.props.deviceInfo?.deviceOrientation ?? 'portrait'
            }
            os={this.props.deviceInfo?.isIos ? 'iOS' : 'Android'}
            isLoading
        >
            <LoadingBalls />
        </LoadingContainer>
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
                    <SectionCircle size="60px" />
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
                        color="prime1"
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

    private renderAIResults = () => {
        const markdownStyles = StyleSheet.create({
            heading1: {
                fontSize: 32,
                color: '#CACAD1', // Replace this with the actual color from your theme
                minHeight: 40,
                lineHeight: 40,
            },
            heading2: {
                fontSize: 24,
                color: '#CACAD1', // Replace this with the actual color from your theme
                lineHeight: 35,
            },
            body: {
                fontSize: 16,
                color: '#CACAD1', // Replace this with the actual color from your theme
                lineHeight: 24,
                paddingBottom: 40,
            },
            link: {
                color: '#6AE394',
            },
        })

        const DismissKeyboard = ({ children }) => (
            <TouchableWithoutFeedback
                onPress={() => {
                    Keyboard.dismiss()
                }}
            >
                {children}
            </TouchableWithoutFeedback>
        )

        return (
            <AIResultsContainer
                summaryHalfScreen={this.state.summaryHalfScreen}
                showAIResults={this.state.showAIResults}
                height={this.state.displaySplitHeight}
            >
                <TextInputContainer
                    AIQueryTextFieldHeight={
                        this.state.AIQueryTextFieldHeight ?? 24
                    }
                >
                    <Icon
                        icon={icons.Stars}
                        heightAndWidth={'22px'}
                        strokeWidth={'0px'}
                        fill
                        height={'50px'}
                    />
                    <AIQueryField
                        onSubmitEditing={(event) => {
                            this.processEvent('onAIQuerySubmit', {
                                prompt: event.nativeEvent.text,
                                fullPageUrl:
                                    this.props.pageUrl || this.state.url,
                            })
                        }}
                        style={{
                            textAlignVertical: 'top',
                            alignSelf: 'flex-start',
                        }}
                        onPressIn={() => {
                            this.processEvent('clearAIquery', null)
                        }}
                        onContentSizeChange={(event) => {
                            this.processEvent(
                                'setAIQueryTextFieldHeight',
                                event.nativeEvent.contentSize.height,
                            )
                        }}
                        // numberOfLines={
                        //     this.state.AIQueryTextFieldHeight ?? 24 / 24
                        // }
                        placeholder={
                            this.state.prompt
                                ? this.state.prompt
                                : 'Ask a question about this page'
                        }
                        placeholderTextColor={'#A9A9B1'}
                        multiline
                    />
                </TextInputContainer>
                {this.state.AISummaryLoading === 'running' ? (
                    <LoadingContainer>
                        <LoadingBalls />
                    </LoadingContainer>
                ) : this.state.AIsummaryText.length > 0 ? (
                    <DismissKeyboard>
                        <AIResultsTextContainer keyboardShouldPersistTaps="never">
                            <Markdown
                                keyboardShouldPersistTaps="never"
                                onLinkPress={(url) => {
                                    if (!this.state.summaryHalfScreen) {
                                        this.processEvent(
                                            'makeSummaryHalfScreen',
                                            null,
                                        )
                                    }
                                    return this.runFnInWebView(
                                        'jumpToTimestamp',
                                        url,
                                    )
                                }}
                                style={markdownStyles}
                            >
                                {this.state.AIsummaryText}
                            </Markdown>
                        </AIResultsTextContainer>
                    </DismissKeyboard>
                ) : (
                    this.renderAIquerySuggestions()
                )}
            </AIResultsContainer>
        )
    }

    private renderAIquerySuggestions = () => {
        const querySuggestions = [
            'Summarize this for me',
            'Tell me the key takeaways',
            `Explain this to me in simple terms`,
            `Translate this into English`,
        ]

        return (
            <AIquerySuggestionsContainer>
                <AIquerySuggestionsTitle>
                    Prompt Suggestions
                </AIquerySuggestionsTitle>
                {querySuggestions.map((query) => (
                    <AiQuerySuggestionsItem
                        onPress={() => {
                            this.processEvent('onAIQuerySubmit', {
                                prompt: query,
                                fullPageUrl:
                                    this.props.pageUrl || this.state.url,
                            })
                        }}
                    >
                        <AiQuerySuggestionsItemText>
                            {query}
                        </AiQuerySuggestionsItemText>
                    </AiQuerySuggestionsItem>
                ))}
            </AIquerySuggestionsContainer>
        )
    }

    private renderWebView() {
        if (this.state.error) {
            return (
                <ErrorView
                    url={this.state.url}
                    message={this.state.error.message}
                    alreadyReported={this.state.isErrorReported}
                    onErrorReport={() => this.processEvent('reportError', {})}
                />
            )
        }

        if (this.state.loadState === 'running') {
            return (
                <LoadingBox>
                    <LoadingBalls />
                </LoadingBox>
            )
        }

        const urlToRender = this.state.url ?? this.props.pageUrl
        return (
            <WebViewContainer
                deviceOrientation={
                    this.props.deviceInfo?.deviceOrientation ?? 'portrait'
                }
                os={this.props.deviceInfo?.isIos ? 'iOS' : 'Android'}
                AIuiShown={this.state.showAIResults}
                summaryHalfScreen={this.state.summaryHalfScreen}
                height={this.state.displaySplitHeight}
            >
                <WebView
                    mediaPlaybackRequiresUserAction
                    allowsFullscreenVideo={
                        this.props.deviceInfo?.deviceOrientation === 'landscape'
                            ? true
                            : false
                    }
                    allowsInlineMediaPlayback
                    source={{ uri: urlToRender }}
                    injectedJavaScript={this.generateInitialJSToInject()}
                    onNavigationStateChange={this.handleNavStateChange}
                    style={{
                        backgroundColor: 'white',
                        height: '100%',
                        maxHeight: 950,
                    }}
                    startInLoadingState
                    // This flag needs to be set to afford text selection on iOS.
                    //   https://github.com/react-native-community/react-native-webview/issues/1275
                    allowsLinkPreview
                    renderError={this.renderError}
                    renderLoading={() => (
                        <LoadingBox>
                            <LoadingBalls />
                        </LoadingBox>
                    )}
                    ref={(ref) => (this.webView = ref!)}
                    onMessage={({ nativeEvent }) => {
                        this.handleWebViewMessageReceived(nativeEvent.data)
                    }}
                    menuItems={
                        isUrlYTVideo(urlToRender)
                            ? [{ label: 'Add Note', key: 'highlight' }]
                            : [
                                  { label: 'Highlight', key: 'highlight' },
                                  { label: 'Add Note', key: 'annotate' },
                              ]
                    }
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
            <Container
                deviceOrientation={
                    this.props.deviceInfo?.deviceOrientation ?? 'portrait'
                }
                os={this.props.deviceInfo?.isIos ? 'iOS' : 'Android'}
                deviceHeight={this.props.deviceInfo?.height}
                statusBarHeight={this.state.statusBarHeight ?? 0}
            >
                {!this.props.hideNavigation && (
                    <Navigation
                        leftBtnPress={() => this.processEvent('goBack', null)}
                        leftIcon={icons.BackArrow}
                        leftIconSize="24px"
                        leftIconStrokeWidth="0px"
                        titleText={'Annotate this page'}
                        rightBtnPress={() => Linking.openURL(this.state.url)}
                        rightIcon={icons.ExternalLink}
                        rightIconSize="24px"
                        rightIconStrokeWidth="0px"
                    />
                )}
                <SplitPaneContainer>
                    <SplitPane
                        splitSource={null}
                        splitContainerStyle={{
                            width: '100%',
                            alignItems: 'center',
                            zIndex: 2000,
                        }}
                        split="v"
                        primary="first"
                        value={Math.floor(this.state.displaySplitHeight || 0)}
                        min={Dimensions.get('window').height * 0.05}
                        max={this.props.deviceInfo.height - 300}
                        onChange={this.onChangeSliderValue}
                        onFinish={this.onChangeSliderValue}
                        displayHeight={this.props.deviceInfo.height}
                    >
                        {this.renderWebView()}
                        {this.renderAIResults()}
                    </SplitPane>
                </SplitPaneContainer>
                <ActionBarContainer>
                    {this.props.location === 'shareExt' && (
                        <PageClosePill onPress={this.props.closeModal}>
                            <Icon
                                icon={icons.BackArrow}
                                heightAndWidth="15px"
                                strokeWidth="0"
                                fill
                                color="prime1"
                                hoverOff
                            />
                            <PageCloseText>Close Memex</PageCloseText>
                        </PageClosePill>
                    )}
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
                        onAIButtonPress={() => {
                            this.processEvent('onAIButtonPress', null)
                            // if (this.state.AIsummaryText.length === 0) {
                            //     this.processEvent('onAIQuerySubmit', {
                            //         prompt: 'Summarise this page for me',
                            //         fullPageUrl:
                            //             this.state.url || this.props.pageUrl,
                            //     })
                            // }
                        }}
                        createYoutubeTimestamp={() => {
                            this.runFnInWebView('createYoutubeTimestamp')
                        }}
                        onCommentBtnPress={() =>
                            this.processEvent('navToPageEditor', {
                                mode: 'notes',
                            })
                        }
                        spaceCount={this.state.spaces.length}
                        pageUrl={this.state.url}
                        deviceInfo={this.props.deviceInfo}
                        AIisOpen={this.state.showAIResults}
                    />
                </ActionBarContainer>
            </Container>
        )
    }
}

const SplitPaneContainer = styled.View`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    position: relative;
    top: 0;
    min-height: 30%;
    flex: 1;
    z-index: 0;
    background: ${(props) => props.theme.colors.greyScale1};
    overflow: hidden;
`

const IconContainer = styled(TouchableOpacity)`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
`

const AIquerySuggestionsTitle = styled.Text`
    color: ${(props) => props.theme.colors.greyScale5};
    font-size: 16px;
    padding: 5px 0;
    margin-bottom: 10px;
`

const AIquerySuggestionsContainer = styled.View`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    padding: 10px 20px 0 20px;
`

const AiQuerySuggestionsItem = styled(TouchableOpacity)`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
    border-radius: 5px;
    padding: 5px;
    background: ${(props) => props.theme.colors.greyScale2};
`

const AiQuerySuggestionsItemText = styled.Text`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.colors.greyScale6};
    font-size: 14px;
    font-weight: 400;
`

const LoadingBox = styled.SafeAreaView<{}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 600px;
    height: 100%;
    flex: 1;
`

const TextInputContainer = styled.View<{
    AIQueryTextFieldHeight: number
}>`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    min-height: 50px;
    height: ${(props) => props.AIQueryTextFieldHeight}px;
    border-radius: 8px;
    padding: 0 10px;
    margin: 10px;
    border-width: 1px;
    border-radius: 8px;
    border-color: ${(props) => props.theme.colors.greyScale2};
    background: ${(props) => props.theme.colors.greyScale2};

    ${(props) =>
        props.AIQueryTextFieldHeight > 50 &&
        css<any>`
            height: ${(props) => props.AIQueryTextFieldHeight + 20}px;
        `};

    &:focus-within {
        border-color: ${(props) => props.theme.colors.greyScale3};
    }
`

const AIQueryField = styled.TextInput<{
    AIQueryTextFieldHeight: number
}>`
    background: transparent;
    flex: 1;
    color: ${(props) => props.theme.colors.greyScale6};
    padding: 15px 0 10px 0;
    padding-left: 10px;
    height: 100%;
    display: flex;
    align-items: flex-start;
    align-self: flex-start;

    ${(props) =>
        props.AIQueryTextFieldHeight > 50 &&
        css<any>`
            padding: 0 25px;
        `};
`

const AIResultsContainer = styled.View<{
    showAIResults: boolean
    summaryHalfScreen?: boolean
    height?: number
}>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    position: relative;
    z-index: 1000;
    background: ${(props) => props.theme.colors.greyScale1};
    min-height: 30px;
    flex: 1;

    ${(props) =>
        !props.showAIResults &&
        css<any>`
            position: absolute;
            height: 0px;
            bottom: 0;
            opacity: 0;
            z-index: -1;
        `};
    ${(props) =>
        props.summaryHalfScreen &&
        css<any>`
            position: relative;
            bottom: 0;
            opacity: 1;
            z-index: 1;
        `};
`

const AIResultsTextContainer = styled.ScrollView`
    flex: 1;
    width: 100%;
    min-height: 30px;
    padding: 0 20px 0px 20px;
`

const AIResultsText = styled(Markdown)`
    color: ${(props) => props.theme.colors.greyScale7};
    font-size: 16px;
    font-weight: 400;
    margin-bottom: 10px;
    font-family: 'Satoshi';
    min-height: 30px;
    flex: 1;
    width: 100%;
    line-height: 24px;
    min-height: 100px;
    overflow: scroll;
`

const PageClosePill = styled(TouchableOpacity)`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 24px;
    background: ${(props) => props.theme.colors.greyScale2};
    border: 1px solid ${(props) => props.theme.colors.greyScale3};
    border-radius: 15px;
    position: absolute;
    top: -24px;
    left: 2px;
    padding: 0 5px 2px 2px;
    z-index: 1000;
`

const PageCloseText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale7};
    font-size: 12px;
    font-weight: 300;
    margin-left: 5px;
    font-family: 'Satoshi';
`

const ActionBarContainer = styled.View`
    position: relative;
    bottom: 0px;
    width: 100%;
    display: flex;
    align-items: center;
    height: ${ActionBarHeight}px;
`

const Container = styled.SafeAreaView<{
    deviceOrientation: 'portrait' | 'landscape'
    os: 'iOS' | 'Android'
    deviceHeight?: number
    statusBarHeight?: number
}>`
    min-height: 30px;
    display: flex;
    position: absolute;
    top: 0px;
    max-height: 950px;
    align-items: flex-end;
    background: ${(props) => props.theme.colors.greyScale1};
    position: relative;
    /* height: ${(props) =>
        props.deviceHeight ?? 0 - props.statusBarHeight! ?? 0}px; */
    flex: 1;
    justify-content: center;

    ${(props) =>
        props.os === 'iOS' &&
        css<any>`
            ${(props) =>
                props.deviceOrientation === 'portrait' &&
                css<any>`
                    overflow: hidden;
                    border-radius: 0px;
                `};
            ${(props) =>
                props.deviceOrientation === 'landscape' &&
                css<any>`
                    border-radius: 8px;
                `};
        `};
    ${(props) =>
        props.os === 'Android' &&
        css<any>`
            ${(props) =>
                props.deviceOrientation === 'portrait' &&
                css<any>`
                    border-radius: 0px;
                    overflow: hidden;
                `};
            ${(props) =>
                props.deviceOrientation === 'landscape' &&
                css<any>`
                    border-radius: 0px;
                    overflow: hidden;
                `};
        `};
`

const LoadingContainer = styled.SafeAreaView<{
    deviceOrientation?: 'portrait' | 'landscape'
    isLoading?: boolean
    os?: 'iOS' | 'Android'
    AIuiShown?: boolean
    deviceHeight?: number
}>`
    background: ${(props) => props.theme.colors.greyScale1};
    width: 100%;
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    height: 100px;
    ${(props) =>
        props.isLoading
            ? `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    `
            : ''}

    ${(props) =>
        props.os === 'iOS' &&
        css<any>`
            ${(props) =>
                props.deviceOrientation === 'portrait' &&
                css<any>`
                    border-radius: 10px;
                `};
            ${(props) =>
                props.deviceOrientation === 'landscape' &&
                css<any>`
                    border-radius: 50px;
                    width: 110%;
                `};
        `};
    ${(props) =>
        props.os === 'Android' &&
        css<any>`
            ${(props) => props.deviceOrientation === 'portrait' && css<any>``};
            ${(props) =>
                props.deviceOrientation === 'landscape' &&
                css<any>`
                    width: 110%;
                `};
        `};
`

const WebViewContainer = styled.SafeAreaView<{
    deviceOrientation?: 'portrait' | 'landscape'
    isLoading?: boolean
    os: 'iOS' | 'Android'
    AIuiShown?: boolean
    deviceHeight?: number
    summaryHalfScreen?: boolean
    height?: number
}>`
    background: ${(props) => props.theme.colors.white};
    width: 100%;
    display: flex;
    position: relative;
    min-height: 30px;
    max-height: 950px;
    flex: 1;
    opacity: 1;
    z-index: 0
        ${(props) =>
            props.isLoading
                ? `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 0px;
    `
                : ''}
        ${(props) =>
            props.os === 'iOS' &&
            css<any>`
                ${(props) =>
                    props.deviceOrientation === 'portrait' &&
                    css<any>`
                        border-radius: 10px;
                    `};
                ${(props) =>
                    props.deviceOrientation === 'landscape' &&
                    css<any>`
                        border-radius: 50px;
                        width: 110%;
                    `};
            `};
    ${(props) =>
        props.os === 'Android' &&
        css<any>`
            ${(props) => props.deviceOrientation === 'portrait' && css<any>``};
            ${(props) =>
                props.deviceOrientation === 'landscape' &&
                css<any>`
                    width: 110%;
                `};
        `};

    /* ${(props) =>
        props.AIuiShown &&
        css<any>`
            position: absolute;
            height: 0px;
            top: 0;
            opacity: 0;
            z-index: -1;
        `}; */
    /* ${(props) =>
        props.summaryHalfScreen &&
        css<any>`
            position: relative;
            min-height: ${props.height && props.height + 'px'};
            top: 0;
            opacity: 1;
            z-index: 1;
        `}; */
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
    font-family: 'Satoshi';
`

const Header = styled.Text`
    font-size: 22px;
    font-weight: 800;
    color: ${(props) => props.theme.colors.greyScale6};
    margin-bottom: 10px;
    font-family: 'Satoshi';
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
    font-family: 'Satoshi';
`
