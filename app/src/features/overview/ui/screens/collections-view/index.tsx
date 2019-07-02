import React from 'react';
import { View, FlatList, ListRenderItem } from 'react-native';
import { StatefulUIElement } from 'src/ui/types'

import Logic, { State, Event } from './logic';
import styles from './styles'
import CollectionEntry from '../../components/collection-entry'
import { Collection } from 'src/features/overview/types';

interface Props {

}

export default class CollectionsView extends StatefulUIElement<Props, State, Event> {
    constructor(props : Props) {
        super(props, { logic: new Logic() })
    }

    private renderCollection: ListRenderItem<Collection> = ({ item: { id, name } }) => (
      <CollectionEntry
        key={id}
        name={name}
        isSelected={id === this.state.selectedCollection}
        onSelect={e => this.processEvent('selectCollection', { id })}
      />
    )

    render() {
        return (
          <View style={styles.container}>
            <FlatList
              renderItem={this.renderCollection}
              data={this.state.collections}
              style={styles.list}
              keyExtractor={(item, index) => index.toString()}
             />
          </View>
        );
      }
}
