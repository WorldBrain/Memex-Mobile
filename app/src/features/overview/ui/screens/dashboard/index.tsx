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
    Text,
} from 'react-native'
import Logic, { State, Event, Props } from './logic'
import { NavigationScreen } from 'src/ui/types'
import styles from './styles'
import ResultPage from '../../components/result-page'
import { UIPage } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import * as selectors from './selectors'
import EmptyResults from '../../components/empty-results'
import DashboardNav from '../../components/dashboard-navigation'
import LoadingBalls from 'src/ui/components/loading-balls'
import * as scrollHelpers from 'src/utils/scroll-helpers'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { MOBILE_LIST_NAME } from '@worldbrain/memex-storage/lib/mobile-app/features/meta-picker/constants'
import SyncRibbon from '../../components/sync-ribbon'

export default class Dashboard extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private navToPageEditor = (page: UIPage, mode: EditorMode) => () => {
        this.props.navigation.navigate('PageEditor', {
            pageUrl: page.fullUrl,
            mode,
        })
    }

    private resetDashboard = () => {
        this.processEvent('setSyncRibbonShow', { show: false })
        this.processEvent('reload', { initList: MOBILE_LIST_NAME })
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

    private handleVisitPress = ({ fullUrl }: UIPage) => () => {
        Linking.openURL(fullUrl)
    }

    private handleScrollToEnd = ({
        nativeEvent,
    }: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (scrollHelpers.isAtTop(nativeEvent)) {
            return this.processEvent('reloadAndSync', {
                initList: this.state.selectedListName,
            })
        }

        if (scrollHelpers.isAtBottom(nativeEvent)) {
            return this.processEvent('loadMore', {})
        }
    }

    private handleListsFilterPress = () => {
        this.props.navigation.navigate('ListsFilter', {
            selectedList: this.state.selectedListName,
        })
    }

    private handleLogoPress = () => {
        if (this.state.selectedListName === MOBILE_LIST_NAME) {
            return
        }
        this.processEvent('setFilteredListName', {
            name: MOBILE_LIST_NAME,
        })
        this.resetDashboard()
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
                    onScrollEndDrag={this.handleScrollToEnd}
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

        return 'Recently Saved'
    }

    render() {
        return (
            <>
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
                    {this.state.shouldShowSyncRibbon && (
                        <SyncRibbon onPress={this.resetDashboard} />
                    )}
                </DashboardNav>
                <View style={styles.container}>{this.renderList()}</View>
            </>
        )
    }
}
