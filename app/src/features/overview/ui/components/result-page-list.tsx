import React from 'react'
import { FlatList, ListRenderItem } from 'react-native'

import ResultPage, { Props as PageProps } from './result-page'
import { NativeTouchEventHandler } from '../../types'
import styles from './result-page-list.styles'

export interface Props {
    pages: PageProps[]
    initPageDelete: (page: PageProps) => NativeTouchEventHandler
    initPageTag: (page: PageProps) => NativeTouchEventHandler
    initPageComment: (page: PageProps) => NativeTouchEventHandler
    initPageStar: (page: PageProps) => NativeTouchEventHandler
}

class ResultPageList extends React.PureComponent<Props> {
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

    render() {
        return (
            <FlatList
                renderItem={this.renderPage}
                data={this.props.pages}
                style={styles.pageList}
                keyExtractor={(item, index) => index.toString()}
            />
        )
    }
}

export default ResultPageList
