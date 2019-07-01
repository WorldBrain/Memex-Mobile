import React from 'react'
import {
    Text,
    SectionList,
    SectionListData,
    ListRenderItem,
    SectionListRenderItem,
} from 'react-native'

import ResultPage, { Props as PageProps } from './result-page-with-notes'
import { NativeTouchEventHandler } from '../../types'
import styles from './result-note-list.styles'

export interface Props {
    sections: SectionListData<PageProps>[]
    initPageDelete: (page: PageProps) => NativeTouchEventHandler
    initPageTag: (page: PageProps) => NativeTouchEventHandler
    initPageComment: (page: PageProps) => NativeTouchEventHandler
    initPageStar: (page: PageProps) => NativeTouchEventHandler
}

class ResultNoteList extends React.PureComponent<Props> {
    private renderPage: ListRenderItem<PageProps> = ({ item, index }) => (
        <ResultPage
            onDeletePress={this.props.initPageDelete(item)}
            onTagPress={this.props.initPageTag(item)}
            onCommentPress={this.props.initPageComment(item)}
            onStarPress={this.props.initPageStar(item)}
            key={index}
            {...item}
        />
    )

    private renderSection: SectionListRenderItem<PageProps> = ({ section: { title } }) => (
        <Text style={styles.sectionText}>{title}</Text>
    )

    render() {
        return (
            <SectionList
                renderItem={this.renderPage}
                renderSectionHeader={this.renderSection}
                sections={this.props.sections}
                style={styles.pageList}
                keyExtractor={(item, index) => item + index}
            />
        )
    }
}

export default ResultNoteList
