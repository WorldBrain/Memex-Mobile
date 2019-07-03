import React from 'react'
import { FlatList, ListRenderItem, View } from 'react-native'
import { StatefulUIElement } from 'src/ui/types'

import Logic, { State, Event } from './logic'
import styles from './styles'
import ResultPage, { Props as PageProps } from '../../components/result-page'
import { Page } from 'src/features/overview/types'

interface Props {}

export default class PagesView extends StatefulUIElement<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private renderPage: ListRenderItem<Page> = ({ item, index }) => (
        <ResultPage
            onCommentPress={() => console.log(item)}
            onDeletePress={() => console.log(item)}
            onStarPress={() => console.log(item)}
            onTagPress={() => console.log(item)}
            key={index}
            {...item}
        />
    )

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    renderItem={this.renderPage}
                    data={this.state.pages}
                    style={styles.pageList}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}
