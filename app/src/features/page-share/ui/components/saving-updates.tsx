import React from 'react'
import { View, Text } from 'react-native'

import styles from './saving-updates.styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import styled from 'styled-components/native'

export interface Props {}

const SavingUpdates: React.StatelessComponent<Props> = (props) => (
    <Container>
        <InnerContainer>
            <LoadingBalls />
            <TitleText>Saving Changes</TitleText>
        </InnerContainer>
    </Container>
)

const Container = styled.View`
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const InnerContainer = styled.View`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 150px;
`

const TitleText = styled.Text`
    color: ${(props) => props.theme.colors.white};
    font-size: 20px;
    font-weight: 500;
    font-family: 'Satoshi';
    padding-top: 30px;
`

export default SavingUpdates
