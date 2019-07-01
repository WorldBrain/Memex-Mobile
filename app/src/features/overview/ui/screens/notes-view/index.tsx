import React from 'react';
import { View } from 'react-native';
import { StatefulUIElement } from 'src/ui/types'

import Logic, { State, Event } from './logic';
import styles from './styles'
import NoteList from '../../components/result-note-list'

interface Props {

}

export default class NotesView extends StatefulUIElement<Props, State, Event> {
    constructor(props : Props) {
        super(props, { logic: new Logic() })
    }

    render() {
        return (
          <View style={styles.container}>
            <NoteList
                initPageComment={props => () => console.log(props)}
                initPageDelete={props => () => console.log(props)}
                initPageStar={props => () => console.log(props)}
                initPageTag={props => () => console.log(props)}
                sections={this.state.sections}
             />
          </View>
        );
      }
}
