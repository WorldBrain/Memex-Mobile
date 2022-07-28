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
import { UIPage } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import EmptyResults from '../../components/empty-results'
import LoadingBalls from 'src/ui/components/loading-balls'
import * as scrollHelpers from 'src/utils/scroll-helpers'
import { SPECIAL_LIST_IDS } from '@worldbrain/memex-common/lib/storage/modules/lists/constants'
import SyncRibbon from '../../components/sync-ribbon'
import Navigation from '../../components/navigation'
import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'
import { normalizedStateToArray } from '@worldbrain/memex-common/lib/common-ui/utils/normalized-state'
import SpacePill from 'src/ui/components/space-pill'
import ListShareBtn from 'src/features/list-share-btn'
import { ALL_SAVED_FILTER_ID } from './constants'
import FeedActivityIndicator from 'src/features/activity-indicator'

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

    private handleLogoPress = () => {
        if (this.state.selectedListId !== SPECIAL_LIST_IDS.MOBILE) {
            this.props.navigation.setParams({
                selectedListId: SPECIAL_LIST_IDS.MOBILE,
            })
            this.processEvent('setFilteredListId', {
                id: SPECIAL_LIST_IDS.MOBILE,
            })
        }

        this.processEvent('reload', { initListId: SPECIAL_LIST_IDS.MOBILE })
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
                {this.state.reloadState === 'running' && (
                    <LoadingBallsBox>
                        <LoadingBalls />
                    </LoadingBallsBox>
                )}
                <ResultsList
                    data={preparedData}
                    renderItem={this.renderListPage}
                    keyExtractor={this.listKeyExtracter}
                    onScrollEndDrag={this.handleScrollToEnd}
                    scrollEventThrottle={32}
                    onEndReachedThreshold={0.1}
                    onEndReached={this.handleListEndReached}
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
                />
                {this.state.loadMoreState === 'running' && (
                    <LoadingBallsBox>
                        <LoadingBalls />
                    </LoadingBallsBox>
                )}
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
                    {selectedListData.name}
                </NavTitleText>
                <ListShareBtn
                    localListId={selectedListData.id}
                    remoteListId={selectedListData.remoteId ?? null}
                    services={this.props.services}
                    onListShare={(remoteListId) =>
                        this.processEvent('shareSelectedList', { remoteListId })
                    }
                />
            </NavTitleContainer>
        )
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
                    renderIndicator={() => (
                        <FeedActivityIndicator services={this.props.services} />
                    )}
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

const ResultsList = (styled(FlatList)`
    background: ${(props) => props.theme.colors.backgroundColor};
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
    font-weight: 800;
    text-align-vertical: bottom;
    color: ${(props) => props.theme.colors.darkerText};
`
