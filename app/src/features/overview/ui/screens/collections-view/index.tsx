import React from 'react'
import {
    View,
    FlatList,
    ListRenderItem,
    GestureResponderEvent,
} from 'react-native'
import { StatefulUIElement } from 'src/ui/types'

import Logic, { State, Event } from './logic'
import styles from './styles'
import CollectionEntry from '../../components/collection-entry'
import { UICollection } from 'src/features/overview/types'
import * as selectors from './selectors'

interface Props {
    hideCollectionsView: () => void
}

export default class CollectionsView extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, new Logic())
    }

    private handleCollectionSelection = (name: string) => (
        e: GestureResponderEvent,
    ) => {
        this.processEvent('selectCollection', { name })
        this.props.hideCollectionsView()
    }

    private renderCollection: ListRenderItem<UICollection> = ({
        item: { id, name },
    }) => (
        <CollectionEntry
            key={id}
            name={name}
            isSelected={name === selectors.selected(this.state)}
            onSelect={this.handleCollectionSelection(name)}
        />
    )

    render() {
        const datas = [{ id: '1', name: 'name 2' }]
        return (
            <View style={styles.container}>
                <FlatList
                    renderItem={this.renderCollection}
                    data={datas}
                    style={styles.list}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}
