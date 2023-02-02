import React from 'react'
import { ColorThemeKeys } from '../theme/types'
import { theme } from '../theme/theme'
import styled from 'styled-components/native'
import { SvgProps } from 'react-native-svg'
import { IconKeysMobile } from '@worldbrain/memex-common/lib/common-ui/styles/types'

const defaultHeight = '20px'
const defaultWidth = '20px'

export type IconProps = {
    icon: React.FC<SvgProps>
    height?: string
    width?: string
    heightAndWidth?: string
    color?: ColorThemeKeys
    rotate?: string
    hoverOff?: boolean
    strokeWidth?: string
    fill?: boolean
}

export const Icon: React.StatelessComponent<IconProps> = (props) => {
    return (
        <IconContainer rotate={props.rotate}>
            {React.createElement(props.icon, {
                fill: props.fill
                    ? props.color
                        ? theme.colors[props.color]
                        : theme.colors['greyScale4']
                    : 'none',
                strokeWidth: props.strokeWidth ? props.strokeWidth : 1.5,
                stroke: props.color
                    ? theme.colors[props.color]
                    : theme.colors['greyScale4'],
                width: props.width
                    ? props.width
                    : props.heightAndWidth
                    ? props.heightAndWidth
                    : defaultWidth,
                height: props.height
                    ? props.height
                    : props.heightAndWidth
                    ? props.heightAndWidth
                    : defaultHeight,
            })}
        </IconContainer>
    )
}

const IconContainer = styled.View<{ rotate?: string; color?: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotateZ(${(props) => props.rotate ?? '0deg'});
`
