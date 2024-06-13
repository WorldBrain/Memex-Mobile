import React from 'react'
import {
    FlatList,
    ListRenderItem,
    Alert,
    Linking,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native'
import Logic, { State, Event, Props } from './logic'
import { StatefulUIElement } from 'src/ui/types'
import ResultPage from '../../components/result-page'
import type { UIPage } from 'src/features/overview/types'
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
import { DEEP_LINK_SCHEME, FEED_OPEN_URL } from 'src/ui/navigation/deep-linking'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import WebView from 'react-native-webview'
import Navigation from 'src/features/overview/ui/components/navigation'
import SuggestInput from 'src/features/meta-picker/ui/components/suggest-input'
import NotesList from '../../components/notes-list'

export default class Dashboard extends StatefulUIElement<Props, State, Event> {
    static BOTTOM_PAGINATION_TRIGGER_PX = 200
    private unsubNavFocus!: () => void

    constructor(props: Props) {
        super(props, new Logic(props))
    }

    async componentDidMount() {
        Linking.addEventListener('url', this.handleReceivedDeepLink)
        Linking.getInitialURL().then((url) => {
            if (this.props.route.params?.skipDeepLinkCheck) {
                return
            }
            return this.handleReceivedDeepLink({ url })
        })
        await super.componentDidMount()

        this.unsubNavFocus = this.props.navigation.addListener('focus', () =>
            this.processEvent('focusFromNavigation', this.props.route.params),
        )
    }

    async componentWillUnmount() {
        this.unsubNavFocus()
        Linking.removeEventListener('url', this.handleReceivedDeepLink)
        await super.componentWillUnmount()
    }

    private handleReceivedDeepLink = async (event: {
        url: string | null
    }): Promise<void> => {
        if (event.url == null) {
            return
        }
        const readerPattern = /memex:\/\/reader\/(.+)/
        if (event.url === DEEP_LINK_SCHEME + FEED_OPEN_URL) {
            await this.processEvent('maybeOpenFeed', null)
        } else if (readerPattern.test(event.url)) {
            const pageUrl = event.url.match(readerPattern)?.[1]!
            // TODO: Why does the route param's URL need to be decoded twice???
            const decodedPageUrl = decodeURIComponent(
                decodeURIComponent(pageUrl),
            )
            if (pageUrl) {
                this.props.navigation.navigate('Reader', {
                    url: decodedPageUrl,
                    updatePage: (page) =>
                        this.processEvent('updatePage', { page }),
                })
            } else {
                console.error(
                    `Deep linking to the reader did not receive a URL`,
                )
            }
        }
    }

    private navToPageEditor = ({ url }: UIPage, mode: EditorMode) => () => {
        this.props.navigation.navigate('PageEditor', {
            pageUrl: 'https://' + url!, // TODO: Doing this as there's something wrong with the fullUrl - always results in a trailing / when normalized in there
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
        const threshold = 50 // pixels past the top the user must scroll up
        if (
            scrollHelpers.isAtTop(nativeEvent) &&
            nativeEvent.contentOffset.y < -threshold
        ) {
            await this.processEvent('reload', {
                initListId: this.state.selectedListId,
                triggerSync: true,
            })
        }
    }

    private handleListEndReached = async (args: {
        distanceFromEnd: number
    }) => {
        if (
            this.state.loadMoreState !== 'running' &&
            !this.state.resultsExhausted
        ) {
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
            notesList={this.renderNotesForPage(item)}
            showNotes={this.state.showNotes}
            {...item}
        />
    )

    private listKeyExtracter = (item: UIPage) => item.url

    private renderSpaceTitleSection = () => {
        const allSavedMode =
            this.state.listData[this.state.selectedListId!]?.id ===
            ALL_SAVED_FILTER_ID
        return (
            <SpaceTitleContainer>
                <SpaceTitleContent>
                    <SpaceTitleText>
                        {this.state.listData[this.state.selectedListId].name}
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
                            <SyncingText numberOfLines={1}>
                                syncing{'  '}
                                {this.state.totalDownloads > 0 ? (
                                    <>
                                        {this.state.totalDownloads -
                                            this.state.downloadProgress}{' '}
                                        changes
                                    </>
                                ) : null}
                            </SyncingText>
                            <LoadingBalls size={16} />
                        </SyncingIconContainer>
                    )}
                    <IconContainer
                        onPress={() => this.processEvent('toggleNotes', null)}
                    >
                        <Icon
                            icon={
                                this.state.showNotes
                                    ? icons.Compress
                                    : icons.Expand
                            }
                            heightAndWidth={'22px'}
                            strokeWidth={'0px'}
                            fill
                        />
                    </IconContainer>
                    <IconContainer
                        onPress={() =>
                            this.props.navigation.navigate('SettingsMenu')
                        }
                    >
                        <Icon
                            icon={icons.Settings}
                            heightAndWidth={'22px'}
                            strokeWidth={'0px'}
                            fill
                        />
                    </IconContainer>
                </TopIconsContainer>
            </SpaceTitleContainer>
        )
    }

    private renderNotesForPage(pageData: UIPage) {
        return (
            <NotesList
                mode="search-results"
                actionSheetService={this.props.services.actionSheet}
                initNoteAddSpaces={(note) => () =>
                    this.processEvent('setAnnotationToEdit', {
                        pageId: pageData.url,
                        annotId: note.url,
                        showSpacePicker: true,
                    })}
                initNoteEdit={(note) => () =>
                    this.processEvent('setAnnotationToEdit', {
                        pageId: pageData.url,
                        annotId: note.url,
                    })}
                initNoteDelete={(n) => () =>
                    this.processEvent('confirmNoteDelete', {
                        pageId: pageData.url,
                        annotId: n.url,
                    })}
                notes={pageData.notes}
                listData={this.state.listData}
                pageData={pageData}
                clearBackground
            />
        )
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
                {this.state.shouldShowRetroSyncNotif && (
                    <RetroSyncNotif>
                        <RetroSyncNotifText>
                            There were some sync issues in a past release
                            leading to some missing data. {'\n'}
                            Run the sync now and you should be back on track in
                            a few minutes. {'\n'} Leave the app open while
                            syncing.
                        </RetroSyncNotifText>
                        <RetroSyncBtn
                            onPress={() =>
                                this.processEvent(
                                    'performRetroSyncToDLMissingChanges',
                                    null,
                                )
                            }
                        >
                            <Icon
                                icon={icons.Alert}
                                strokeWidth="2"
                                heightAndWidth="18px"
                                color="greyScale1"
                            />
                            <RetroSyncBtnText>
                                Sync missing data
                            </RetroSyncBtnText>
                        </RetroSyncBtn>
                    </RetroSyncNotif>
                )}
                <ResultsList
                    data={preparedData}
                    renderItem={this.renderListPage}
                    keyExtractor={this.listKeyExtracter}
                    onScrollEndDrag={this.handleScrollToEnd}
                    scrollEventThrottle={32}
                    onEndReachedThreshold={1}
                    onEndReached={this.handleListEndReached}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingBottom: 100,
                    }}
                    ListHeaderComponent={this.renderSpaceTitleSection()}
                    ListEmptyComponent={
                        <EmptyResults
                            searchQuery={this.state.searchQuery}
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

    private renderNavigation() {
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
                <ResultsContainer>
                    <SearchBox>
                        <SuggestInput
                            placeholder="Search what you saved"
                            value={this.state.searchQuery}
                            onChange={(query) =>
                                this.processEvent('setSearchQuery', { query })
                            }
                            background="greyScale3"
                        />
                    </SearchBox>
                    {this.renderList()}
                </ResultsContainer>
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
                            color="greyScale6"
                            fill
                        />
                        <FooterActionText>All Saved</FooterActionText>
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
                            icon={icons.Plus}
                            strokeWidth="0"
                            heightAndWidth="18px"
                            color="greyScale6"
                            fill
                        />
                        <FooterActionText>Spaces</FooterActionText>
                    </FooterActionBtn>
                    <FooterActionBtn
                        onPress={() =>
                            Linking.openURL(
                                `https://go.crisp.chat/chat/embed/?website_id=05013744-c145-49c2-9c84-bfb682316599&user_email=${this.state.currentUser?.email}`,
                            )
                        }
                    >
                        <FeedActivityIndicatorBox>
                            <FeedActivityIndicator
                                services={this.props.services}
                            />
                        </FeedActivityIndicatorBox>
                        <Icon
                            icon={icons.HelpIcon}
                            strokeWidth="0"
                            heightAndWidth="18px"
                            color="greyScale5"
                            fill
                        />
                        <FooterActionText>Get Support</FooterActionText>
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

const SearchBox = styled.View`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 15px 10px 0;
`

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
    margin-right: 10px;
`

const SyncingIconContainer = styled.View`
    height: 30px;
    margin-right: 8px;
    width: 200px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
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

const RetroSyncNotif = styled.View`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    margin-top: 5px;
    border-radius: 5px;
    background: ${(props) => props.theme.colors.greyScale1};
`

const RetroSyncNotifText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale7};
    font-size: 16px;
    text-align: center;
`

const RetroSyncBtn = styled.TouchableOpacity`
    background: ${(props) => props.theme.colors.prime1};
    border-radius: 6px;
    padding: 5px 10px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
`

const RetroSyncBtnText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale1};
    margin-left: 10px;
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
    flex: 1;
    text-align: center;
`
const FooterActionBar = styled.View`
    display: flex;
    flex-direction: row;
    background: ${(props) => props.theme.colors.greyScale3};
    border: 1px solid ${(props) => props.theme.colors.greyScale2};
    width: 100%;
    margin: 0 7%;
    border-radius: 8px;
    position: absolute;
    bottom: 20px;
    padding: 0 10%;
    justify-content: space-between;
`

const FooterActionText = styled.Text`
    color: ${(props) => props.theme.colors.white};
    font-size: 12px;
    margin-top: 4px;
    font-weight: 400;
    font-family: 'Satoshi';
    text-align: center;
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
    align-items: flex-start;
    justify-content: flex-start;

    padding: 0 10px;
    height: 100%;
`

const ResultsList = (styled(FlatList)`
    background: ${(props) => props.theme.colors.black};
    display: flex;
    padding: 5px;
    flex-direction: column;
    width: 100%;
` as unknown) as typeof FlatList

const SpacesArea = styled.View`
    display: flex;
    flex-direction: row;
    margin-top: 10px;
    flex-wrap: wrap;
    margin-bottom: -5px;
`
