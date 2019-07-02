import React from 'react';
import {
  Text,
  View,
  SectionList,
  ListRenderItem,
  SectionListRenderItem,
} from 'react-native'

import { StatefulUIElement } from 'src/ui/types'
import ResultPage, { Props as PageProps } from '../../components/result-page-with-notes'
import Logic, { State, Event } from './logic';
import styles from './styles'

interface Props {

}

export default class NotesView extends StatefulUIElement<Props, State, Event> {
    constructor(props : Props) {
        super(props, { logic: new Logic() })
    }

    private renderPage: ListRenderItem<PageProps> = ({ item, index }) => (
      <ResultPage
          initNoteDelete={() => console.log(item)}
          initNoteEdit={() => console.log(item)}
          initNoteStar={() => console.log(item)}
          onStarPress={() => console.log(item)}
          onCommentPress={() => console.log(item)}
          onDeletePress={() => console.log(item)}
          onTagPress={() => console.log(item)}
          key={index}
          {...item}
      />
  )

  private renderSection: SectionListRenderItem<PageProps> = ({ section: { title } }) => (
      <Text style={styles.sectionText}>{title}</Text>
  )


    render() {
        return (
          <View style={styles.container}>
              <SectionList
                renderItem={this.renderPage}
                renderSectionHeader={this.renderSection}
                sections={this.state.sections}
                style={styles.pageList}
                keyExtractor={(item, index) => index.toString()}
            />
          </View>
        );
      }
}
