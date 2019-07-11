import React from 'react'
import { View, FlatList, ListRenderItem } from 'react-native'
import { StatefulUIElement } from 'src/ui/types'

import Logic, { State, Event } from './logic'
import styles from './styles'
import CollectionEntry from '../../components/collection-entry'
import { UICollection } from 'src/features/overview/types'
import * as selectors from './selectors'

interface Props {}

export default class CollectionsView extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, { logic: new Logic() })
    }

    private renderCollection: ListRenderItem<UICollection> = ({
        item: { id, name },
    }) => (
        <CollectionEntry
            key={id}
            name={name}
            isSelected={name === selectors.selected(this.state)}
            onSelect={e => this.processEvent('selectCollection', { name })}
        />
    )

    render() {
        return (
            <View style={styles.container}>
                <FlatList
                    renderItem={this.renderCollection}
                    data={selectors.collectionsList(this.state)}
                    style={styles.list}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}
