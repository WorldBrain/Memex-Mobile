import React from 'react'
import {
    View,
    Image,
    TouchableOpacity,
    Text,
    GestureResponderEvent,
} from 'react-native'

import * as icons from 'src/ui/components/icons/icons-list'
import styled, { css } from 'styled-components/native'
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
                    <EntryText checked={props.isChecked}>
                        {props.name}
                    </EntryText>
                </EntryTextBox>
            </TextContainer>
            <CheckMarkContainer checked={props.isChecked}>
                {props.isChecked ? (
                    <EmptyCircle checked={props.isChecked}>
                        <Icon
                            icon={icons.CheckMark}
                            color={props.isChecked && 'black'}
                            heightAndWidth="20px"
                            strokeWidth="0px"
                            fill
                        />
                    </EmptyCircle>
                ) : (
                    <EmptyCircle checked={props.isChecked} />
                )}
            </CheckMarkContainer>
        </Container>
    </TouchableOpacity>
)

export default MetaPickerEntry

const EntryText = styled.Text<{
    checked: boolean
}>`
    color: ${(props) => props.theme.colors.greyScale6};
    font-size: 16px;
    font-weight: 300;

    ${(props) =>
        props.checked &&
        css`
            color: ${(props) => props.theme.colors.white};
            font-weight: 400;
        `};
`

const NewText = styled.Text`
    font-size: 16px;
    color: ${(props) => props.theme.colors.prime1};
    font-weight: 800;
    margin-right: 15px;
    font-family: 'Satoshi';
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

const CheckMarkContainer = styled.View<{
    checked: boolean
}>`
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
`

const EmptyCircle = styled.View<{
    checked: boolean
}>`
    height: 20px;
    width: 20px;
    border-radius: 3px;
    background: ${(props) => props.theme.colors.greyScale2};

    ${(props) =>
        props.checked &&
        css`
            background: ${(props) => props.theme.colors.white};
        `};
`
