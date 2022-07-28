import React from 'react'
import styled from 'styled-components/native'
import { StatefulUIElement } from 'src/ui/types'

import Logic, { State, Event, Dependencies } from './logic'

export interface Props extends Dependencies {}

export default class FeedActivityIndicator extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, new Logic(props))
    }

    render() {
        return (
            <Dot
                unread={this.state.hasActivity}
                onPress={() => this.processEvent('pressBtn', null)}
            />
        )
    }
}

const Dot = styled.TouchableOpacity<{ unread: boolean }>`
    border-radius: 10px;
    width: 14px;
    height: 14px;
    background: ${(props) =>
        props.unread ? props.theme.colors.purple : props.theme.colors.white};
    border: 2px solid
        ${(props) =>
            props.unread
                ? props.theme.colors.purple
                : props.theme.colors.lineGrey};
`
