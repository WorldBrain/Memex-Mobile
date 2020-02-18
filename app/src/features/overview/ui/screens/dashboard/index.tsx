import React from 'react'
import {
    FlatList,
    ListRenderItem,
    View,
    Alert,
    Linking,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native'
import Logic, { State, Event, Props } from './logic'
import { NavigationScreen } from 'src/ui/types'
import styles from './styles'
import ResultPage from '../../components/result-page'
import { UIPage } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import * as selectors from './selectors'
import EmptyResults from '../../components/empty-results'
import LoadingBalls from 'src/ui/components/loading-balls'
import * as scrollHelpers from 'src/utils/scroll-helpers'

export default class Dashboard extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private navToPageEditor = (page: UIPage, mode: EditorMode) => () => {
        this.props.navigation.navigate('PageEditor', { page, mode })
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
            return this.processEvent('reload', {})
        }

        if (scrollHelpers.isAtBottom(nativeEvent)) {
            return this.processEvent('loadMore', {})
        }
    }

    private renderPage: ListRenderItem<UIPage> = ({ item, index }) => (
        <ResultPage
            onVisitPress={this.handleVisitPress(item)}
            onResultPress={this.initHandleResultPress(item)}
            onDeletePress={this.initHandleDeletePress(item)}
            onStarPress={this.initHandlePageStar(item)}
            onCommentPress={this.navToPageEditor(item, 'notes')}
            onTagPress={this.navToPageEditor(item, 'tags')}
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

    render() {
        return <View style={styles.container}>{this.renderList()}</View>
    }
}
