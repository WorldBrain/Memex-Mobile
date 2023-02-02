import React from 'react'
import {
    FlatList,
    ListRenderItem,
    Alert,
    Linking,
    NativeSyntheticEvent,
    NativeScrollEvent,
    Dimensions,
} from 'react-native'
import Logic, { State, Event, Props } from './logic'
import { StatefulUIElement } from 'src/ui/types'
import ResultPage from '../../components/result-page'
import { UIPage } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import EmptyResults from '../../components/empty-results'
import LoadingBalls from 'src/ui/components/loading-balls'
import * as scrollHelpers from 'src/utils/scroll-helpers'
import { SPECIAL_LIST_IDS } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import SyncRibbon from '../../components/sync-ribbon'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'
import { normalizedStateToArray } from '@worldbrain/memex-common/lib/common-ui/utils/normalized-state'
import SpacePill from 'src/ui/components/space-pill'
import ListShareBtn from 'src/features/list-share-btn'
import { ALL_SAVED_FILTER_ID } from './constants'
import FeedActivityIndicator from 'src/features/activity-indicator'
import { DEEP_LINK_PREFIX, FEED_OPEN_URL } from 'src/ui/navigation/deep-linking'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import WebView from 'react-native-webview'
import Navigation, {
    height as navigationBarHeight,
} from 'src/features/overview/ui/components/navigation'

export default class Dashboard extends StatefulUIElement<Props, State, Event> {
    static BOTTOM_PAGINATION_TRIGGER_PX = 200
    private unsubNavFocus!: () => void

    private flatList!: FlatList

    constructor(props: Props) {
        super(props, new Logic(props))
    }

    componentDidMount() {
        super.componentDidMount()

        Linking.addEventListener('url', async ({ url }) => {
            if (url === DEEP_LINK_PREFIX + FEED_OPEN_URL) {
                await this.processEvent('maybeOpenFeed', null)
            }
        })
        this.unsubNavFocus = this.props.navigation.addListener('focus', () =>
            this.processEvent('focusFromNavigation', this.props.route.params),
        )
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        this.unsubNavFocus()
    }

    private navToPageEditor = ({ fullUrl }: UIPage, mode: EditorMode) => () => {
        this.props.navigation.navigate('PageEditor', {
            pageUrl: fullUrl,
            mode,
            updatePage: (page) => this.processEvent('updatePage', { page }),
        })
    }

    private resetDashboard = () => {
        this.processEvent('setSyncRibbonShow', { show: false })
        this.processEvent('reload', { initListId: this.state.selectedListId })
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
            updatePage: (page) => this.processEvent('updatePage', { page }),
        })
    }

    private handleVisitPress = ({ fullUrl }: UIPage) => () => {
        Linking.openURL(fullUrl)
    }

    private handleScrollToEnd = async ({
        nativeEvent,
    }: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (scrollHelpers.isAtTop(nativeEvent)) {
            await this.processEvent('reload', {
                initListId: this.state.selectedListId,
                triggerSync: true,
            })
        }
    }

    private handleListEndReached = async (args: {
        distanceFromEnd: number
    }) => {
        if (this.state.loadMoreState !== 'running') {
            await this.processEvent('loadMore', {})
        }
    }

    private handleListsFilterPress = () => {
        this.props.navigation.navigate('ListsFilter', {
            selectedListId: this.state.selectedListId,
        })
    }

    private renderListPage: ListRenderItem<
        UIPage & { spacePills?: JSX.Element }
    > = ({ item }) => (
        <ResultPage
            onVisitPress={this.handleVisitPress(item)}
            onResultPress={this.initHandleResultPress(item)}
            onDeletePress={this.initHandleDeletePress(item)}
            onCommentPress={this.navToPageEditor(item, 'notes')}
            onListsPress={this.navToPageEditor(item, 'collections')}
            onReaderPress={this.initHandleReaderPress(item)}
            spacePills={item.spacePills}
            {...item}
        />
    )

    private listKeyExtracter = (item: UIPage) => item.url

    private renderList() {
        if (this.state.showFeed) {
            return (
                <WebViewContainer>
                    <WebView
                        source={{ url: 'https://staging.memex.social/feed' }}
                        style={{ height: '100%' }}
                    />
                </WebViewContainer>
            )
        }

        if (this.state.reloadState === 'running') {
            return (
                <ResultListContainer>
                    <LoadingBallsBox>
                        <LoadingBalls />
                    </LoadingBallsBox>
                </ResultListContainer>
            )
        }

        const preparedData: Array<
            UIPage & { spacePills?: JSX.Element }
        > = normalizedStateToArray(this.state.pages).map((item) => ({
            ...item,
            spacePills:
                item.listIds.length > 0 ? (
                    <SpacesArea>
                        {item.listIds.map((listId) => (
                            <SpacePill
                                key={listId}
                                name={this.state.listData[listId]?.name}
                                isShared={
                                    this.state.listData[listId]?.remoteId !=
                                    null
                                }
                            />
                        ))}
                    </SpacesArea>
                ) : undefined,
        }))

        return (
            <ResultListContainer>
                <ResultsList
                    data={preparedData}
                    ref={(ref) => (this.flatList = ref!)}
                    renderItem={this.renderListPage}
                    keyExtractor={this.listKeyExtracter}
                    onScrollEndDrag={this.handleScrollToEnd}
                    scrollEventThrottle={32}
                    onEndReachedThreshold={1.5}
                    onEndReached={this.handleListEndReached}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 100,
                    }}
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
                    ListFooterComponent={() =>
                        this.state.loadMoreState === 'running' ? (
                            <LoadMoreBallBox>
                                <LoadingBalls />
                            </LoadMoreBallBox>
                        ) : this.state.resultsExhausted ? (
                            <ResultsExhaustedContainer>
                                <Icon
                                    icon={icons.CheckedRound}
                                    strokeWidth="0"
                                    heightAndWidth="18px"
                                    color="greyScale4"
                                    fill
                                />
                                <ResultsExhaustedText>
                                    End of Results
                                </ResultsExhaustedText>
                            </ResultsExhaustedContainer>
                        ) : (
                            <LastItemEmpty />
                        )
                    }
                />
            </ResultListContainer>
        )
    }

    private renderNavTitle(): React.ReactNode {
        if (this.state.shouldShowSyncRibbon) {
            return (
                <SyncRibbon
                    text={'New Sync Updates'}
                    onPress={this.resetDashboard}
                />
            )
        }

        const selectedListData = this.state.listData[this.state.selectedListId]
        if (selectedListData == null) {
            return ''
        }

        if (
            [
                ALL_SAVED_FILTER_ID,
                SPECIAL_LIST_IDS.INBOX,
                SPECIAL_LIST_IDS.INBOX,
            ].includes(this.state.selectedListId)
        ) {
            return selectedListData.name
        }

        return (
            <NavTitleContainer>
                <NavTitleText numberOfLines={1}>
                    {!this.state.showFeed ? selectedListData.name : 'Hive Feed'}
                </NavTitleText>
                {!this.state.showFeed && (
                    <ListShareBtn
                        localListId={selectedListData.id}
                        remoteListId={selectedListData.remoteId ?? null}
                        services={this.props.services}
                        onListShare={(remoteListId) =>
                            this.processEvent('shareSelectedList', {
                                remoteListId,
                            })
                        }
                    />
                )}
            </NavTitleContainer>
        )
    }

    render() {
        return (
            <Container>
                <Navigation
                    // leftBtnPress={this.handleListsFilterPress}
                    leftIconSize={'26px'}
                    rightIcon={icons.Settings}
                    rightIconStrokeWidth={'0'}
                    rightBtnPress={() =>
                        this.props.navigation.navigate('SettingsMenu')
                    }
                    titleText={this.renderNavTitle()}
                />
                <ResultsContainer>{this.renderList()}</ResultsContainer>
                <FooterActionBar>
                    <FooterActionBtn
                        onPress={() => {
                            this.processEvent('setFilteredListId', {
                                id: ALL_SAVED_FILTER_ID,
                            })
                            this.processEvent('reload', {
                                initListId: ALL_SAVED_FILTER_ID,
                                triggerSync: true,
                            })
                        }}
                    >
                        <Icon
                            icon={icons.HeartIcon}
                            strokeWidth="0"
                            heightAndWidth="18px"
                            color="greyScale5"
                            fill
                        />
                        <FooterActionText>Saved</FooterActionText>
                    </FooterActionBtn>
                    {/* <FooterActionBtn
                        onPress={() => {
                            this.processEvent('setFilteredListId', {
                                id: SPECIAL_LIST_IDS.INBOX,
                            })
                            this.processEvent('reload', {
                                initListId: SPECIAL_LIST_IDS.INBOX,
                            })
                        }}
                    >
                        <Icon
                            icon={icons.Inbox}
                            strokeWidth="0"
                            heightAndWidth="18px"
                            color="greyScale5"
                            fill
                        />
                        <FooterActionText>Inbox</FooterActionText>
                    </FooterActionBtn> */}
                    <FooterActionBtn
                        onPress={() => this.handleListsFilterPress()}
                    >
                        <Icon
                            icon={icons.SpacesEmtpy}
                            strokeWidth="0"
                            heightAndWidth="18px"
                            color="greyScale5"
                            fill
                        />
                        <FooterActionText>Spaces</FooterActionText>
                    </FooterActionBtn>
                    <FooterActionBtn
                        onPress={() => this.processEvent('toggleFeed', null)}
                    >
                        <FeedActivityIndicatorBox>
                            <FeedActivityIndicator
                                services={this.props.services}
                            />
                        </FeedActivityIndicatorBox>
                        <Icon
                            icon={icons.Feed}
                            strokeWidth="0"
                            heightAndWidth="18px"
                            color="greyScale5"
                            fill
                        />
                        <FooterActionText>Feed</FooterActionText>
                    </FooterActionBtn>
                </FooterActionBar>
            </Container>
        )
    }
}

const Testtesxt = styled.Text`
    width: 100%;
`

const WebViewContainer = styled.View<{
    isLandscape?: boolean
    isLoading?: boolean
}>`
    width: 100%;
    height: 100%;
    background: red;
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

const FeedActivityIndicatorBox = styled.View`
    position: absolute;
    right: -3px;
    top: -3px;
    z-index: 1;
`

const LastItemEmpty = styled.View`
    height: 100px;
`

const ResultsExhaustedContainer = styled.View`
    display: flex;
    flex-direction: row;
    width: 100%;
    margin-top: 15px;
    justify-content: center;
    align-items: flex-start;
    height: 100px;
`

const ResultsExhaustedText = styled.Text`
    display: flex;
    margin-left: 5px;
    font-size: 12px;
    color: ${(props) => props.theme.colors.greyScale4};
`

const LoadingBallsBox = styled.View`
    height: 70%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
`
const LoadMoreBallBox = styled.View`
    height: 300px;
    position: relative;
    display: flex;
    align-items: center;
    padding-top: 50px;
    padding-bottom: 300px;
    justify-content: flex-start;
`

const FooterActionBtn = styled.TouchableOpacity`
    display: flex;
    margin: 10px;
    position: relative;
    align-items: center;
    width: 42px;
    text-align: center;
`
const FooterActionBar = styled.View`
    display: flex;
    flex-direction: row;
    background: ${(props) => props.theme.colors.greyScale1};
    border: 1px solid ${(props) => props.theme.colors.greyScale2};
    border-radius: 10px;

    position: absolute;
    bottom: 20px;
    padding: 0 10px;
`

const FooterActionText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale4};
    font-size: 12px;
    margin-top: 4px;
    font-weight: 400;
`

const Container = styled.SafeAreaView`
    height: 100%;
    position: absolute;
    width: 100%;
    background: ${(props) => props.theme.colors.black};
    display: flex;
    align-items: center;
    position: absolute;
`

const ResultsContainer = styled.View`
    display: flex;
    margin: 0px 5px;
    width: 100%;
`

const ResultListContainer = styled.View`
    display: flex;
    align-items: flex-start;
`

const ResultsList = (styled(FlatList)`
    background: ${(props) => props.theme.colors.black};
    display: flex;
    padding: 5px;
` as unknown) as typeof FlatList

const SpacesArea = styled.View`
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    flex-wrap: wrap;
    margin-bottom: -5px;
`

const NavTitleContainer = styled.View`
    display: flex;
    flex-direction: row;
`

const NavTitleText = styled.Text`
    font-size: 16px;
    height: 100%;
    align-items: center;
    display: flex;
    font-weight: 600;
    color: ${(props) => props.theme.colors.white};
`
