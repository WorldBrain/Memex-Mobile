import React from 'react'
import { FlatList, ListRenderItem, View, Alert } from 'react-native'
import { StatefulUIElement } from 'src/ui/types'

import Logic, { State, Event } from './logic'
import styles from './styles'
import ResultPage from '../../components/result-page'
import { Page } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import * as selectors from './selectors'

interface Props {}

export default class PagesView extends StatefulUIElement<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private navToPageEditor = (page: Page, mode: EditorMode) => () =>
        this.props.navigation.navigate('PageEditor', { page, mode })

    private initHandleDeletePress = (page: Page) => () =>
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

    private initHandlePageDelete = ({ url }: Page) => () => {
        this.processEvent('deletePage', { url })
    }

    private initHandlePageStar = ({ url }: Page) => () => {
        this.processEvent('togglePageStar', { url })
    }

    private renderPage: ListRenderItem<Page> = ({ item, index }) => (
        <ResultPage
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
                    renderItem={this.renderPage}
                    data={selectors.results(this.state)}
                    style={styles.pageList}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}
