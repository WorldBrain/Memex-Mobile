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
import { SPECIAL_LIST_NAMES } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import SyncRibbon from '../../components/sync-ribbon'
import Navigation from '../../components/navigation'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'

export default class Dashboard extends StatefulUIElement<Props, State, Event> {
    static BOTTOM_PAGINATION_TRIGGER_PX = 200
    private unsubNavFocus!: () => void

    constructor(props: Props) {
        super(props, new Logic(props))
    }

    componentDidMount() {
        super.componentDidMount()
        this.unsubNavFocus = this.props.navigation.addListener('focus', () =>
            this.processEvent('focusFromNavigation', this.props.route.params),
        )
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.unsubNavFocus()
    }

    private navToPageEditor =
        ({ fullUrl }: UIPage, mode: EditorMode) =>
        () => {
            this.props.navigation.navigate('PageEditor', {
                pageUrl: fullUrl,
                mode,
                updatePage: (page) => this.processEvent('updatePage', { page }),
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

    private initHandlePageDelete =
        ({ url }: UIPage) =>
        () => {
            this.processEvent('deletePage', { url })
        }

    private initHandlePageStar =
        ({ url }: UIPage) =>
        () => {
            this.processEvent('togglePageStar', { url })
        }

    private initHandleResultPress =
        ({ url }: UIPage) =>
        () => {
            this.processEvent('toggleResultPress', { url })
        }

    private initHandleReaderPress =
        ({ url, titleText }: UIPage) =>
        () => {
            this.props.navigation.navigate('Reader', {
                url,
                title: titleText,
                updatePage: (page) => this.processEvent('updatePage', { page }),
            })
        }

    private handleVisitPress =
        ({ fullUrl }: UIPage) =>
        () => {
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
        this.props.navigation.navigate('ListsFilter', {
            selectedList: this.state.selectedListName,
        })
    }

    private handleLogoPress = () => {
        if (this.state.selectedListName !== SPECIAL_LIST_NAMES.MOBILE) {
            this.props.navigation.setParams({
                selectedList: SPECIAL_LIST_NAMES.MOBILE,
            })
            this.processEvent('setFilteredListName', {
                name: SPECIAL_LIST_NAMES.MOBILE,
            })
        }

        this.processEvent('reload', { initList: SPECIAL_LIST_NAMES.MOBILE })
    }

    private renderPage: ListRenderItem<UIPage> = ({ item, index }) => (
        <ResultPage
            onVisitPress={this.handleVisitPress(item)}
            onResultPress={this.initHandleResultPress(item)}
            onDeletePress={this.initHandleDeletePress(item)}
            onStarPress={this.initHandlePageStar(item)}
            onCommentPress={this.navToPageEditor(item, 'notes')}
            onListsPress={this.navToPageEditor(item, 'collections')}
            onReaderPress={this.initHandleReaderPress(item)}
            key={index}
            {...item}
        />
    )

    private renderList() {
        if (
            this.state.loadState === 'pristine' ||
            this.state.loadState === 'running'
        ) {
            return (
                <ResultListContainer>
                    <LoadingBalls />
                </ResultListContainer>
            )
        }

        return (
            <ResultListContainer>
                {this.state.reloadState === 'running' && (
                    <LoadingBallsBox>
                        <LoadingBalls />
                    </LoadingBallsBox>
                )}
                <ResultsList
                    renderItem={this.renderPage}
                    data={selectors.results(this.state)}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={
                        <EmptyResults
                            goToPairing={() =>
                                this.props.navigation.navigate('CloudSync')
                            }
                            goToTutorial={() =>
                                this.props.navigation.navigate('Onboarding', {
                                    redoOnboarding: true,
                                })
                            }
                        />
                    }
                    onScroll={this.handleScroll}
                    onScrollEndDrag={this.handleScrollToEnd}
                    scrollEventThrottle={16}
                    contentContainerStyle={styles.resultsList}
                />
                {this.state.loadMoreState === 'running' && (
                    <LoadingBallsBox>
                        <LoadingBalls />
                    </LoadingBallsBox>
                )}
            </ResultListContainer>
        )
    }

    private renderNavTitle(): string | JSX.Element {
        if (this.state.shouldShowSyncRibbon) {
            return (
                <SyncRibbon
                    text={'New Sync Updates'}
                    onPress={this.resetDashboard}
                />
            )
        } else if (this.state.selectedListName !== SPECIAL_LIST_NAMES.MOBILE) {
            return this.state.selectedListName
        }

        return 'Saved on Mobile'
    }

    render() {
        return (
            <Container>
                <Navigation
                    leftIcon={icons.Burger}
                    leftBtnPress={this.handleListsFilterPress}
                    leftIconSize={'26px'}
                    rightIcon={icons.Settings}
                    rightBtnPress={() =>
                        this.props.navigation.navigate('SettingsMenu')
                    }
                    titleText={this.renderNavTitle()}
                />
                <ResultsContainer>{this.renderList()}</ResultsContainer>
            </Container>
        )
    }
}

const LoadingBallsBox = styled.View`
    height: 200px;
`

const Container = styled.SafeAreaView`
    height: 100%;
    position: absolute;
    width: 100%;
    background: ${(props) => props.theme.colors.backgroundColor};
    display: flex;
    align-items: center;
    position: absolute;
`

const ResultsContainer = styled.View`
    display: flex;
    margin: 0px 5px;
`

const ResultListContainer = styled.View`
    display: flex;
    align-items: stretch;
`

const ResultsList = styled(FlatList)`
    background: ${(props) => props.theme.colors.backgroundColor};
    display: flex;
    padding: 5px;
`
