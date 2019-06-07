import React from 'react';
import { Text, View, Button } from 'react-native';
import { StatefulUIElement } from 'src/ui/types'
import Logic, { State, Event } from './logic';
import styles from './styles'
import { Services } from 'src/services/types';

interface Props {
    services : Pick<Services, 'navigation'>
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
                <Button
                    title="Go to another screen"
                    onPress={() => this.props.services.navigation.goTo('Other')}
                />
            </View>
        );
    }
}
