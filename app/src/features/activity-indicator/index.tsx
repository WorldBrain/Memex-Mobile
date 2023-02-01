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
            <DotBox onPress={() => this.processEvent('pressBtn', null)}>
                <Dot unread={this.state.hasActivity} />
            </DotBox>
        )
    }
}

const DotBox = styled.TouchableOpacity`
    width: 12px;
    height: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const Dot = styled.View<{ unread: boolean }>`
    border-radius: 10px;
    width: 12px;
    height: 12px;
    background: ${(props) =>
        props.unread ? props.theme.colors.prime1 : 'transparent'};
`
