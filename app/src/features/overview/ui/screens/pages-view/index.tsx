import React from 'react';
import { Text, View } from 'react-native';
import { StatefulUIElement } from 'src/ui/types'

import Logic, { State, Event } from './logic';
import styles from './styles'
import PageList from '../../components/result-page-list'

interface Props {

}

export default class PagesView extends StatefulUIElement<Props, State, Event> {
    constructor(props : Props) {
        super(props, { logic: new Logic() })
    }

    render() {
        return (
          <View style={styles.container}>
            <PageList
                initPageComment={props => () => console.log(props)}
                initPageDelete={props => () => console.log(props)}
                initPageStar={props => () => console.log(props)}
                initPageTag={props => () => console.log(props)}
                pages={this.state.pages}
             />
          </View>
        );
      }
}
