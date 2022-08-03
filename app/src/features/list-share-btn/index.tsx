import React from 'react'
import styled from 'styled-components/native'
import { StatefulUIElement } from 'src/ui/types'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import LoadingBalls from 'src/ui/components/loading-balls'
import { Link as LinkIcon } from 'src/ui/components/icons/icons-list'

import Logic, { State, Event, Dependencies } from './logic'

export interface Props extends Dependencies {}

export default class ListShareBtn extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, new Logic(props))
    }

    async componentDidUpdate(prevProps: Props) {
        if (
            prevProps.localListId !== this.props.localListId &&
            this.props.localListId != null
        ) {
            await this.processEvent('resetListIds', {
                localListId: this.props.localListId,
                remoteListId: this.props.remoteListId ?? null,
            })
        }
    }

    private handleBtnPress = () => this.processEvent('pressBtn', null)

    render() {
        if (
            this.state.loadState === 'running' ||
            this.state.listShareState === 'running'
        ) {
            return (
                <LoadingContainer>
                    <LoadingBalls size={16} />
                </LoadingContainer>
            )
        }

        return (
            <Btn onPress={this.handleBtnPress}>
                <Icon icon={LinkIcon} strokeWidth="2px" heightAndWidth="16px" />
            </Btn>
        )
    }
}

const LoadingContainer = styled.View`
    margin-left: 10px;
`

const Btn = styled.TouchableOpacity`
    margin: 0 15px 0 15px;
`
