import React from 'react'
import { FlatList, ListRenderItem, View, Alert, Linking } from 'react-native'
import Logic, { State, Event } from './logic'
import {
    StatefulUIElement,
    NavigationScreen,
    NavigationProps,
} from 'src/ui/types'
import styles from './styles'
import { NAV_PARAMS } from 'src/ui/navigation/constants'
import ResultPage from '../../components/result-page'
import { UIPage } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import * as selectors from './selectors'
import { PageEditorNavigationParams } from 'src/features/page-editor/ui/screens/page-editor/types'

interface Props extends NavigationProps {}

export default class PagesView extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private navToPageEditor = (page: UIPage, mode: EditorMode) => () =>
        this.props.navigation.navigate('PageEditor', {
            [NAV_PARAMS.PAGE_EDITOR]: {
                pageUrl: page.url,
                mode,
            } as PageEditorNavigationParams,
        })

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

    private HandleVisitPress = ({ url }: UIPage) => () => {}

    private renderPage: ListRenderItem<UIPage> = ({ item, index }) => (
        <ResultPage
            onVisitPress={this.HandleVisitPress(item)}
            onDeletePress={this.initHandleDeletePress(item)}
            onStarPress={this.initHandlePageStar(item)}
            onCommentPress={this.navToPageEditor(item, 'notes')}
            onTagPress={this.navToPageEditor(item, 'tags')}
            key={index}
            {...item}
        />
    )

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    style={styles.pageList}
                    renderItem={this.renderPage}
                    data={selectors.results(this.state)}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}
