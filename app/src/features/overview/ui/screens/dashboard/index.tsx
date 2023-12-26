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
import Navigation from 'src/features/overview/ui/components/navigation'

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
            pageUrl: fullUrl!,
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

    private initHandleResultPress = ({ fullUrl }: UIPage) => () => {
        this.processEvent('toggleResultPress', { fullUrl })
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

    private SpaceTitleSection = () => {
        const allSavedMode =
            this.state.listData[this.state.selectedListId!]?.id ===
            ALL_SAVED_FILTER_ID
        if (this.state.selectedListId) {
            return (
                <SpaceTitleContainer>
                    <SpaceTitleContent>
                        <SpaceTitleText>
                            {
                                this.state.listData[this.state.selectedListId]
                                    .name
                            }
                        </SpaceTitleText>
                        {this.state.listData[this.state.selectedListId]
                            ?.description && (
                            <SpaceDescription>
                                {this.state.listData[this.state.selectedListId]
                                    ?.description ?? undefined}
                            </SpaceDescription>
                        )}
                    </SpaceTitleContent>
                    <TopIconsContainer>
                        {allSavedMode && this.state.syncState === 'running' && (
                            <SyncingIconContainer>
                                <SyncingText>syncing{'  '}</SyncingText>
                                <LoadingBalls size={16} />
                            </SyncingIconContainer>
                        )}
                        {allSavedMode && (
                            <IconContainer
                                onPress={() =>
                                    this.props.navigation.navigate(
                                        'SettingsMenu',
                                    )
                                }
                            >
                                <Icon
                                    icon={icons.Settings}
                                    heightAndWidth={'22px'}
                                    strokeWidth={'0px'}
                                    fill
                                />
                            </IconContainer>
                        )}
                    </TopIconsContainer>
                </SpaceTitleContainer>
            )
        }
    }

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
                    ListHeaderComponent={this.SpaceTitleSection()}
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
                        ) : this.state.resultsExhausted &&
                          this.state.pages.allIds.length > 0 ? (
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
        // const selectedListData = this.state.listData[this.state.selectedListId]
        // if (selectedListData == null) {
        //     return ''
        // }
        // if (
        //     [
        //         ALL_SAVED_FILTER_ID,
        //         SPECIAL_LIST_IDS.INBOX,
        //         SPECIAL_LIST_IDS.INBOX,
        //     ].includes(this.state.selectedListId)
        // ) {
        //     return selectedListData.name
        // }
        // return (
        //     <NavTitleContainer>
        //         <NavTitleText numberOfLines={1}>
        //             {!this.state.showFeed ? selectedListData.name : 'Hive Feed'}
        //         </NavTitleText>
        //         {!this.state.showFeed && (
        //             <ListShareBtn
        //                 localListId={selectedListData.id}
        //                 remoteListId={selectedListData.remoteId ?? null}
        //                 services={this.props.services}
        //                 onListShare={(remoteListId) =>
        //                     this.processEvent('shareSelectedList', {
        //                         remoteListId,
        //                     })
        //                 }
        //             />
        //         )}
        //     </NavTitleContainer>
        // )
    }

    renderNavigation() {
        const selectedListData = this.state.listData[this.state.selectedListId]
        if (
            this.state.selectedListId !== ALL_SAVED_FILTER_ID &&
            this.state.selectedListId !== SPECIAL_LIST_IDS.INBOX &&
            this.state.selectedListId !== SPECIAL_LIST_IDS.MOBILE
        ) {
            return (
                <Navigation
                    leftIcon={icons.BackArrow}
                    leftBtnPress={() => {
                        this.processEvent('setFilteredListId', {
                            id: ALL_SAVED_FILTER_ID,
                        })
                        this.processEvent('reload', {
                            triggerSync: true,
                            initListId: ALL_SAVED_FILTER_ID,
                        })
                        this.props.navigation.goBack()
                    }}
                    titleText={this.renderNavTitle()}
                    rightArea={
                        <RightAreaContainer>
                            {this.state.listData[this.state.selectedListId]
                                ?.remoteId && (
                                <IconContainer
                                    onPress={() =>
                                        Linking.openURL(
                                            'https://memex.social/c/' +
                                                this.state.listData[
                                                    this.state.selectedListId
                                                ]?.remoteId,
                                        )
                                    }
                                >
                                    <Icon
                                        icon={icons.ExternalLink}
                                        strokeWidth="0"
                                        heightAndWidth="22px"
                                        color="greyScale4"
                                        fill
                                    />
                                </IconContainer>
                            )}
                            {selectedListData != null && (
                                <ListShareBtn
                                    localListId={
                                        this.state.listData[
                                            this.state.selectedListId
                                        ].id ?? null
                                    }
                                    remoteListId={
                                        selectedListData.remoteId ?? null
                                    }
                                    services={this.props.services}
                                    onListShare={(remoteListId) =>
                                        this.processEvent('shareSelectedList', {
                                            remoteListId,
                                        })
                                    }
                                />
                            )}
                            {/* <PrimaryAction
                                label="Share Space"
                                onPress={() => {}}
                                size="small"
                                type="primary"
                            /> */}
                        </RightAreaContainer>
                    }
                />
            )
        }
    }

    renderUpdatePill = () => {
        if (this.state.shouldShowSyncRibbon) {
            return (
                <SyncRibbon
                    text={'New Sync Updates'}
                    onPress={this.resetDashboard}
                />
            )
        }
    }

    render() {
        return (
            <Container>
                {this.renderNavigation()}
                {this.renderUpdatePill()}
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
                        onPress={() =>
                            Linking.openURL('https://memex.social/feed')
                        }
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
                    {/* <FooterActionBtn
                        onPress={() =>
                            this.props.navigation.navigate('SettingsMenu')
                        }
                    >
                        <Icon
                            icon={icons.Settings}
                            strokeWidth="0"
                            heightAndWidth="18px"
                            color="greyScale5"
                            fill
                        />
                        <FooterActionText>Settings</FooterActionText>
                    </FooterActionBtn> */}
                </FooterActionBar>
            </Container>
        )
    }
}

const SpaceTitleContainer = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`

const TopIconsContainer = styled.View`
    height: 30px;
    width: 30px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
`

const SyncingText = styled.Text`
    font-size: 12px;
    color: ${(props) => props.theme.colors.greyScale6};
    font-weight: 500;
    font-family: 'Satoshi';
`

const SyncingIconContainer = styled.View`
    height: 30px;
    width: 60px;
    margin-right: 8px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`

const IconContainer = styled.TouchableOpacity`
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const RightAreaContainer = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`

const SpaceTitleContent = styled.View`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 15px 5px;
`

const SpaceTitleText = styled.Text`
    font-size: 22px;
    color: ${(props) => props.theme.colors.white};
    font-weight: 500;
    font-family: 'Satoshi';
`

const SpaceDescription = styled.Text`
    font-size: 14px;
    color: ${(props) => props.theme.colors.greyScale6};
    font-weight: 300;
    margin-top: 10px;
    font-family: 'Satoshi';
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
    font-family: 'Satoshi';
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
    width: 48px;
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
    font-family: 'Satoshi';
`

const Container = styled.SafeAreaView`
    height: 100%;
    position: absolute;
    width: 100%;
    background: ${(props) => props.theme.colors.black};
    display: flex;
    align-items: center;
`

const ResultsContainer = styled.View`
    display: flex;
    margin: 0px 5px;
    width: 100%;
`

const ResultListContainer = styled.View`
    display: flex;
    align-items: center;
    padding: 0 10px;
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
