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
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const Dot = styled.View<{ unread: boolean }>`
    border-radius: 10px;
    width: 14px;
    height: 14px;
    background: ${(props) =>
        props.unread ? props.theme.colors.prime1 : props.theme.colors.white};
    border: 2px solid
        ${(props) =>
            props.unread
                ? props.theme.colors.prime1
                : props.theme.colors.greyScale3};
`
