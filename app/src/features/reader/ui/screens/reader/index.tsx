import React from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import Logic, { State, Event, Props } from './logic'
import { NavigationScreen } from 'src/ui/types'
import ActionBar from '../../components/action-bar'
import ReaderWebView from '../../components/web-view'
import styles from './styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import { REMOTE_FUNCTIONS } from 'src/features/reader/utils/in-page-js'

export default class Reader extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private webView!: WebView
    private _mockClick = () => undefined

    private runInWebView = (code: string) =>
        this.webView.injectJavaScript(`${code}; true;`)

    private handleBackClick = () =>
        this.props.navigation.navigate({ routeName: 'Overview' })

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
                onMessage={text =>
                    this.processEvent('setTextSelection', { text })
                }
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
                        this.runInWebView(REMOTE_FUNCTIONS.createHighlight)
                    }
                    onAnnotateBtnPress={() =>
                        this.runInWebView(REMOTE_FUNCTIONS.createAnnotation)
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
