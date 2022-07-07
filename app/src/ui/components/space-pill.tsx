import React from 'react'
import styled from 'styled-components/native'

export interface Props {
    name?: string
}

const SpacePill: React.SFC<Props> = ({ name }) => (
    <SpacePillContainer>
        <SpacePillText>{name ?? 'Missing Space'}</SpacePillText>
    </SpacePillContainer>
)

export default React.memo(SpacePill)

const SpacePillContainer = styled.View`
    padding: 2px 7px;
    background: ${(props) => props.theme.colors.purple};
    align-items: center;
    display: flex;
    text-align-vertical: center;
    margin-right: 3px;
    border-radius: 3px;
`

const SpacePillText = styled.Text`
    color: white;
    display: flex;
    text-align-vertical: center;
`
