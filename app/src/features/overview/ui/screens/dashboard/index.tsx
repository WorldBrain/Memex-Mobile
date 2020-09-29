import React from 'react'
import {
    Image,
    FlatList,
    ListRenderItem,
    View,
    Alert,
    Linking,
    NativeSyntheticEvent,
    NativeScrollEvent,
    TouchableOpacity,
    Text,
} from 'react-native'
import throttle from 'lodash/throttle'

import Logic, { State, Event, Props } from './logic'
import { StatefulUIElement } from 'src/ui/types'
import styles from './styles'
import ResultPage from '../../components/result-page'
import { UIPage } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import * as selectors from './selectors'
import EmptyResults from '../../components/empty-results'
import DashboardNav from '../../components/dashboard-navigation'
import LoadingBalls from 'src/ui/components/loading-balls'
import * as scrollHelpers from 'src/utils/scroll-helpers'
import { MOBILE_LIST_NAME } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/constants'
import SyncRibbon from '../../components/sync-ribbon'

export default class Dashboard extends StatefulUIElement<Props, State, Event> {
    static BOTTOM_PAGINATION_TRIGGER_PX = 200

    constructor(props: Props) {
        super(props, new Logic(props))
    }


    private navToPageEditor = (page: UIPage, mode: EditorMode) => () => {
        this.props.navigation.navigate('PageEditor', {
            selectedList: this.state.selectedListName,
            pageUrl: page.fullUrl,
            mode,
        })
    }

    private resetDashboard = () => {
        this.processEvent('setSyncRibbonShow', { show: false })
        this.processEvent('reload', { initList: this.state.selectedListName })
    }

    private initHandleDeletePress = (page: UIPage) => () =>
        Alert.alert(
            'Delete confirm',
            'Do you really want to delete this page?',
            [
                { text: 'Cancel' },
                {
                    text: 'Delete',
                    onPress: this.initHandlePageDelete(page),
                },
            ],
        )

    private initHandlePageDelete = ({ url }: UIPage) => () => {
        this.processEvent('deletePage', { url })
    }

    private initHandlePageStar = ({ url }: UIPage) => () => {
        this.processEvent('togglePageStar', { url })
    }

    private initHandleResultPress = ({ url }: UIPage) => () => {
        this.processEvent('toggleResultPress', { url })
    }

    private initHandleReaderPress = ({ url, titleText }: UIPage) => () => {
        this.props.navigation.navigate('Reader', {
            url,
            title: titleText,
        })
    }

    private handleVisitPress = ({ fullUrl }: UIPage) => () => {
        Linking.openURL(fullUrl)
    }

    private handleScrollToEnd = ({
        nativeEvent,
    }: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (scrollHelpers.isAtTop(nativeEvent)) {
            return this.processEvent('reload', {
                initList: this.state.selectedListName,
                triggerSync: true,
            })
        }
    }

    private handleScroll = throttle(
        ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (
                this.state.loadMoreState !== 'running' &&
                nativeEvent != null &&
                scrollHelpers.isAtBottom(
                    nativeEvent,
                    Dashboard.BOTTOM_PAGINATION_TRIGGER_PX,
                )
            ) {
                return this.processEvent('loadMore', {})
            }
        },
        300,
        { leading: true },
    )

    private handleListsFilterPress = () => {
        this.props.navigation.push('ListsFilter', {
            selectedList: this.state.selectedListName,
        })
    }

    private handleLogoPress = () => {
        if (this.state.selectedListName === MOBILE_LIST_NAME) {
            return
        }
        this.processEvent('setFilteredListName', { name: MOBILE_LIST_NAME })
        this.processEvent('reload', { initList: MOBILE_LIST_NAME })
    }

    private renderPage: ListRenderItem<UIPage> = ({ item, index }) => (
        <ResultPage
            onVisitPress={this.handleVisitPress(item)}
            onResultPress={this.initHandleResultPress(item)}
            onDeletePress={this.initHandleDeletePress(item)}
            onStarPress={this.initHandlePageStar(item)}
            onCommentPress={this.navToPageEditor(item, 'notes')}
            onTagPress={this.navToPageEditor(item, 'tags')}
            onListsPress={this.navToPageEditor(item, 'collections')}
            onReaderPress={this.initHandleReaderPress(item)}
            key={index}
            {...item}
        />
    )

    private renderList() {
        if (this.state.loadState === 'running') {
            return <LoadingBalls style={styles.mainLoadSpinner} />
        }

        return (
            <>
                {this.state.reloadState === 'running' && (
                    <LoadingBalls style={styles.reloadSpinner} />
                )}
                <FlatList
                    style={styles.pageList}
                    renderItem={this.renderPage}
                    data={selectors.results(this.state)}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={
                        <EmptyResults
                            goToPairing={() =>
                                this.props.navigation.navigate('Sync')
                            }
                            goToTutorial={() =>
                                this.props.navigation.navigate('Onboarding')
                            }
                        />
                    }
                    onScroll={this.handleScroll}
                    onScrollEndDrag={this.handleScrollToEnd}
                    scrollEventThrottle={16}
                />
                {this.state.loadMoreState === 'running' && (
                    <LoadingBalls style={styles.loadMoreSpinner} />
                )}
            </>
        )
    }

    private renderNavTitle(): string {
        if (this.state.selectedListName !== MOBILE_LIST_NAME) {
            return this.state.selectedListName
        }

        return 'Saved on Mobile'
    }

    render() {
        return (
            <>
                {this.state.shouldShowSyncRibbon && (
                    <SyncRibbon onPress={this.resetDashboard} />
                )}
                <DashboardNav
                    icon="settings"
                    onLeftIconPress={this.handleLogoPress}
                    onRightIconPress={() =>
                        this.props.navigation.navigate('SettingsMenu')
                    }
                >
                    <TouchableOpacity
                        style={styles.collectionTitleContainer}
                        onPress={this.handleListsFilterPress}
                    >
                        <Text style={styles.collectionTitle}>
                            {this.renderNavTitle()}
                        </Text>
                        <Image
                            style={styles.dropdownArrow}
                            source={require('src/ui/img/dropdown.png')}
                        />
                    </TouchableOpacity>
                </DashboardNav>

                <View style={styles.container}>{this.renderList()}</View>
            </>
        )
    }
}
