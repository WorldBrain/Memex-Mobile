import React from 'react'
import { View } from 'react-native'
import styled, { css } from 'styled-components/native'

export interface Props {
    count?: number
    selectedIndex?: number
}

const ProgressBalls: React.StatelessComponent<Props> = ({
    count = 3,
    selectedIndex,
}) => (
    <Container>
        {[...Array(count)].map((_, i) => (
            <OuterBall key={i} isSelected={i === selectedIndex}>
                <Ball isSelected={i === selectedIndex} />
            </OuterBall>
        ))}
    </Container>
)

const OuterBall = styled.View<{
    isSelected: boolean
}>`
    height: 10px;
    width: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 30px;
    margin: 4px 6px;

    ${(props) =>
        props.isSelected &&
        css`
            background: ${(props) => props.theme.colors.white};
        `};
`

const Ball = styled.View<{
    isSelected: boolean
}>`
    height: 6px;
    width: 6px;
    border-radius: 30px;
    background: ${(props) =>
        props.isSelected
            ? props.theme.colors.prime1 + '70'
            : props.theme.colors.greyScale2};
`

const Container = styled.View`
    border-radius: 100px;
    border-width: 1px;
    border-color: ${(props) => props.theme.colors.greyScale2};
    padding: 4px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`

export default ProgressBalls
