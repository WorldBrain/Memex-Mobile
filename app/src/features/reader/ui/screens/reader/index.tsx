import React from 'react'
import { View } from 'react-native'

import Logic, { State, Event, Props } from './logic'
import { NavigationScreen } from 'src/ui/types'
import ActionBar from '../../components/action-bar'
import WebView from '../../components/web-view'
import styles from './styles'
import LoadingBalls from 'src/ui/components/loading-balls'

export default class Reader extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private _mockClick = () => undefined

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
            <WebView
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
                    onAnnotateBtnPress={this._mockClick}
                    onBookmarkBtnPress={this._mockClick}
                    onCommentBtnPress={this._mockClick}
                    onHighlightBtnPress={this._mockClick}
                    onListBtnPress={this._mockClick}
                    onTagBtnPress={this._mockClick}
                />
            </View>
        )
    }
}
