import React from 'react'
import { View, Text } from 'react-native'

import styles from './empty-results.styles'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'
import { SectionCircle } from 'src/ui/utils/SectionCircle'

export interface Props {
    goToPairing: () => void
    goToTutorial: () => void
}

const EmptyResults: React.StatelessComponent<Props> = (props) => (
    <Container>
        {SectionCircle(40, icons.HeartIcon)}
        <TitleText>Save your first page</TitleText>
        <SubText>
            Sync with the Memex browser extension {'\n'}or save a page with the
            share menu of your phone.
        </SubText>
    </Container>
)

export default EmptyResults

const Container = styled.View`
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    padding-top: 15%;
`

const TitleText = styled.Text`
    font-size: 20px;
    color: ${(props) => props.theme.colors.white};
    font-weight: 500;
    margin-bottom: 10px;
    margin-top: 20px;
    font-family: 'Satoshi';
`
const SubText = styled.Text`
    font-size: 14px;
    color: ${(props) => props.theme.colors.greyScale5};
    text-align: center;
    font-weight: 300;
    font-family: 'Satoshi';
`
