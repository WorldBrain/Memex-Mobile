import React from 'react';
import { Text, View } from 'react-native';
import { StatefulUIElement } from 'src/ui/types'
import Logic, { State, Event } from './logic';
import styles from './styles'

interface Props {

}
export default class HomeScreen extends StatefulUIElement<Props, State, Event> {
    constructor(props : Props) {
        super(props, { logic: new Logic() })
    }

    render() {
        return (
          <View style={styles.container}>
            <Text style={styles.welcome}>Welcome to React Native!</Text>
            <Text style={styles.instructions}>To bla, just bla the bla</Text>
          </View>
        );
      }    
}
