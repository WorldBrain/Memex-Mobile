import React from 'react'
import { FlatList, ListRenderItem, View, Alert } from 'react-native'
import Logic, { State, Event } from './logic'
import { NavigationScreen, NavigationProps } from 'src/ui/types'
import styles from './styles'
import ResultPage from '../../components/result-page'
import { UIPage } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import * as selectors from './selectors'

interface Props extends NavigationProps {}

export default class SpecialView extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private navToPageEditor = (page: UIPage, mode: EditorMode) => () =>
        this.props.navigation.navigate('PageEditor', { page, mode })

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

    private renderPage: ListRenderItem<UIPage> = ({ item, index }) => (
        <ResultPage
            buttonLabel={'Visit >'}
            onResultPress={this.initHandleResultPress(item)}
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
