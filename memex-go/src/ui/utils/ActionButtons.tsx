import {
    ColorThemeKeys,
    IconKeys,
} from '@worldbrain/memex-common/lib/common-ui/styles/types'
import React from 'react'
import { View, GestureResponderEvent } from 'react-native'
import { SvgProps } from 'react-native-svg'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled, { css } from 'styled-components/native'

export type ActionButtonProps = {
    label?: string
    onPress?: (e: GestureResponderEvent) => void
    height?: string
    width?: string
    fontSize?: string
    color?: ColorThemeKeys
    isDisabled?: boolean
    type?: 'primary' | 'secondary' | 'tertiary' | 'forth'
    size?: 'small' | 'medium' | 'large'
    icon?: IconKeys
    iconSize?: string
}

// PRIMARY ACTION

export const PrimaryAction = (props: ActionButtonProps) => {
    return (
        <PrimaryActionContainer
            {...props}
            onPress={props.isDisabled ? null : props.onPress}
        >
            <PrimaryActionText {...props}>{props.label}</PrimaryActionText>
        </PrimaryActionContainer>
    )
}

const PrimaryActionContainer = styled.TouchableOpacity<ActionButtonProps>`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    align-self: center;
    opacity: ${(props) => (props.isDisabled ? 0.5 : 1)};

    ${(props) =>
        props.type === 'primary' &&
        css`
            background: ${(props) => props.theme.colors.prime1};
        `};
    ${(props) =>
        props.type === 'secondary' &&
        css`
            background: ${(props) => props.theme.colors.white};
        `};
    ${(props) =>
        props.type === 'tertiary' &&
        css`
            background: ${(props) => props.theme.colors.greyScale3};
        `};
    ${(props) =>
        props.type === 'forth' &&
        css`
            background: transparent;
        `};
    ${(props) =>
        props.size === 'small' &&
        css`
            padding: 6px 16px;
        `};
    ${(props) =>
        props.size === 'medium' &&
        css`
            padding: 12px 24px;
        `};
    ${(props) =>
        props.size === 'large' &&
        css`
            padding: 12px 24px;
        `};
`

const PrimaryActionText = styled.Text<ActionButtonProps>`
    font-weight: 500;
    text-align: center;
    flex-wrap: nowrap;
    letter-spacing: 0.5px;

    ${(props) =>
        props.type === 'primary' &&
        css`
            color: ${(props) => props.theme.colors.black};
        `};
    ${(props) =>
        props.type === 'secondary' &&
        css`
            color: ${(props) => props.theme.colors.black};
        `};
    ${(props) =>
        props.type === 'tertiary' &&
        css`
            color: ${(props) => props.theme.colors.white};
        `};
    ${(props) =>
        props.type === 'forth' &&
        css`
            color: ${(props) => props.theme.colors.white};
        `};
    ${(props) =>
        props.size === 'small' &&
        css`
            font-size: 12px;
        `};
    ${(props) =>
        props.size === 'medium' &&
        css`
            font-size: 14px;
        `};
    ${(props) =>
        props.size === 'large' &&
        css`
            font-size: 16px;
        `};
`
