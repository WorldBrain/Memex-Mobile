import React, { Component } from 'react';
import { View, Text } from 'react-native';

interface Props {

}
export default class AppContainer extends Component<Props> {
    constructor(props : Props) {
        super(props)
        // super(props, { logic: new Logic() })
    }

    render() {
        return (
          <View>
            <Text>Loading</Text>
          </View>
        );
      }    
}
