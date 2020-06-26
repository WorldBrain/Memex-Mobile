import React from 'react'
import {
    Text,
    View,
    Alert,
    SectionList,
    SectionListRenderItem,
} from 'react-native'

import { NavigationScreen } from 'src/ui/types'
import { NAV_PARAMS } from 'src/ui/navigation/constants'
import ResultPage from '../../components/result-page-with-notes'
import Logic, { Props, State, Event } from './logic'
import styles from './styles'
import { UIPageWithNotes } from 'src/features/overview/types'
import { EditorMode } from 'src/features/page-editor/types'
import * as selectors from './selectors'
import { NotesSection } from './types'
import { PageEditorNavigationParams } from 'src/features/page-editor/ui/screens/page-editor/types'

export default class NotesView extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    private navToPageEditor = (mode: EditorMode, page: UIPageWithNotes) => () =>
        this.props.navigation.navigate('PageEditor', {
            [NAV_PARAMS.PAGE_EDITOR]: {
                selectedList: (this.logic as Logic).selectedList,
                pageUrl: page.url,
                mode,
            } as PageEditorNavigationParams,
        })

    private initHandleDeletePagePress = args => () =>
        Alert.alert(
            'Delete confirm',
            'Do you really want to delete this page?',
            [
                { text: 'Cancel' },
                {
                    text: 'Delete',
                    onPress: () => this.processEvent('deletePage', args),
                },
            ],
        )

    private initHandleDeleteNotePress = args => () =>
        Alert.alert(
            'Delete confirm',
            'Do you really want to delete this note?',
            [
                { text: 'Cancel' },
                {
                    text: 'Delete',
                    onPress: () => this.processEvent('deleteNote', args),
                },
            ],
        )

    private initHandleToggleNoteStar = args => () =>
        this.processEvent('toggleNoteStar', args)

    private renderPage: SectionListRenderItem<UIPageWithNotes> = ({
        item,
        index,
        section,
    }) => (
        <ResultPage
            // tslint:disable-next-line
            initNoteEdit={() => () => console.log(item)}
            initNoteDelete={note =>
                this.initHandleDeleteNotePress({
                    section: section.title,
                    pageUrl: item.url,
                    noteUrl: note.url,
                })
            }
            initNoteStar={note =>
                this.initHandleToggleNoteStar({
                    section: section.title,
                    pageUrl: item.url,
                    noteUrl: note.url,
                })
            }
            onStarPress={() =>
                this.processEvent('togglePageStar', {
                    section: section.title,
                    pageUrl: item.url,
                })
            }
            onCommentPress={this.navToPageEditor('notes', item)}
            onDeletePress={this.initHandleDeletePagePress({
                section: section.title,
                pageUrl: item.url,
            })}
            onTagPress={this.navToPageEditor('tags', item)}
            onDropdownPress={() =>
                this.processEvent('toggleShowNotes', {
                    section: section.title,
                    pageUrl: item.url,
                })
            }
            key={index}
            {...item}
        />
    )

    private renderSection: SectionListRenderItem<NotesSection> = ({
        section: { title },
    }) => <Text style={styles.sectionText}>{title}</Text>

    render() {
        return (
            <View style={styles.container}>
                <SectionList
                    style={styles.pageList}
                    renderItem={this.renderPage}
                    showsVerticalScrollIndicator={false}
                    sections={selectors.results(this.state)}
                    renderSectionHeader={this.renderSection}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}
