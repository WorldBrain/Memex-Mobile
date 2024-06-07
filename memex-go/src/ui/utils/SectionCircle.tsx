import styled from 'styled-components/native'
import React, { FC } from 'react'
import { Icon } from '../components/icons/icon-mobile'
import { SvgProps } from 'react-native-svg'

export const SectionCircle = (size: number, icon: FC<SvgProps>) => {
    return (
        <CircleBox size={size + 'px'}>
            <Icon
                icon={icon}
                color="prime1"
                heightAndWidth={size / 1.8 + 'px'}
                strokeWidth="0"
                fill
            />
        </CircleBox>
    )
}

const CircleBox = styled.View<{ size: string }>`
    width: ${(props) => props.size};
    height: ${(props) => props.size};
    border-radius: 6px;
    background: ${(props) => props.theme.colors.greyScale3};
    border-width: 1px;
    border-radius: 8px;
    border-color: ${(props) => props.theme.colors.greyScale4};
    display: flex;
    align-items: center;
    justify-content: center;
`
