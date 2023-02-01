import {
    ColorThemeKeys,
    IconKeys,
} from '@worldbrain/memex-common/lib/common-ui/styles/types'
import React from 'react'
import { View, GestureResponderEvent } from 'react-native'
import { SvgProps } from 'react-native-svg'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'

export type ActionButtonProps = {
    label: string
    onPress: (e: GestureResponderEvent) => void
    height?: string
    width?: string
    fontSize?: string
    color?: ColorThemeKeys
    isDisabled?: boolean
}

// PRIMARY ACTION

export const PrimaryAction = (props: ActionButtonProps) => {
    return (
        <PrimaryActionContainer
            {...props}
            onPress={props.isDisabled ? null : props.onPress}
        >
            <PrimaryActionText>{props.label}</PrimaryActionText>
        </PrimaryActionContainer>
    )
}

const PrimaryActionContainer = styled.TouchableOpacity<ActionButtonProps>`
    width: ${(props) => (props.width ? props.width : '150px')};
    height: ${(props) => (props.height ? props.height : '50px')};
    background: ${(props) => props.theme.colors.prime1};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    opacity: ${(props) => (props.isDisabled ? 0.5 : 1)};
`

const PrimaryActionText = styled.Text<ActionButtonProps>`
    font-size: ${(props) => (props.fontSize ? props.fontSize : '16px')};
    color: white;
    font-weight: 500;
    text-align: center;
    flex-wrap: nowrap;
`

// SECONDARY ACTION

export const SecondaryAction = (props: ActionButtonProps) => {
    return (
        <SecondaryActionContainer {...props}>
            <SecondaryActionText>{props.label}</SecondaryActionText>
        </SecondaryActionContainer>
    )
}

const SecondaryActionContainer = styled.TouchableOpacity<ActionButtonProps>`
    width: ${(props) => (props.width ? props.width : '150px')};
    height: ${(props) => (props.height ? props.height : '50px')};
    // border: 2px solid ${(props) => props.theme.colors.purple};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
`

const SecondaryActionText = styled.Text<ActionButtonProps>`
    font-size: ${(props) => (props.fontSize ? props.fontSize : '16px')};
    color: ${(props) => props.theme.colors.purple};
    font-weight: 500;
    text-align: center;
    flex-wrap: nowrap;
`
