import React from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    GestureResponderEvent,
} from 'react-native'

import * as icons from 'src/ui/components/icons/icons-list'
import styled from 'styled-components/native'
import { Icon } from 'src/ui/components/icons/icon-mobile'

import type { SpacePickerEntry } from '../../types'

export interface Props extends SpacePickerEntry {
    canAdd?: boolean
    skipBottomBorder?: boolean
    showTextBackground?: boolean
    onPress: (e: GestureResponderEvent) => void
}

const MetaPickerEntry: React.StatelessComponent<Props> = (props) => (
    <TouchableOpacity onPress={props.onPress}>
        <Container>
            <TextContainer>
                {props.canAdd && <NewText>Add new:</NewText>}
                <EntryTextBox>
                    <EntryText>{props.name}</EntryText>
                </EntryTextBox>
                {props.remoteId != null && (
                    <Icon
                        icon={icons.Shared}
                        fill={true}
                        color="darkerBlue"
                        strokeWidth="2px"
                        heightAndWidth="12px"
                    />
                )}
            </TextContainer>
            <CheckMarkContainer>
                {props.isChecked ? (
                    <Icon icon={icons.CheckedRound} color="blue" />
                ) : (
                    <EmptyCircle />
                )}
            </CheckMarkContainer>
        </Container>
    </TouchableOpacity>
)

export default MetaPickerEntry

const EntryText = styled.Text`
    color: ${(props) => props.theme.colors.darkerText};
    font-size: 16px;
    font-weight: 400;
`

const NewText = styled.Text`
    font-size: 16px;
    color: ${(props) => props.theme.colors.purple};
    font-weight: 800;
    margin-right: 15px;
`

const EntryTextBox = styled.View`
    margin-right: 10px;
`

const TextContainer = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

const CheckMarkContainer = styled.View`
    display: flex;
    flex-direction: row;
    align-items: center;
`

const Container = styled.View`
    height: 50px;
    padding: 0 20px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-style: solid;
    border-bottom-width: 1px;
    border-bottom-color: ${(props) => props.theme.colors.lightgrey};
`

const EmptyCircle = styled.View`
    height: 20px;
    width: 20px;
    border-radius: 50px;
    border-style: solid;
    border-width: 2px;
    border-color: ${(props) => props.theme.colors.lightgrey};
`
