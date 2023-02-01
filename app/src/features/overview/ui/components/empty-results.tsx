import React from 'react'
import { View, Text } from 'react-native'

import styles from './empty-results.styles'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'

export interface Props {
    goToPairing: () => void
    goToTutorial: () => void
}

const EmptyResults: React.StatelessComponent<Props> = (props) => (
    <Container>
        <SectionCircle>
            <Icon
                icon={icons.HeartIcon}
                heightAndWidth={'24px'}
                color="purple"
                strokeWidth="2.5px"
            />
        </SectionCircle>
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

const SectionCircle = styled.View`
    background: ${(props) => props.theme.colors.greyScale3};
    border-radius: 100px;
    height: 50px;
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30px;
`

const TitleText = styled.Text`
    font-size: 20px;
    color: ${(props) => props.theme.colors.greyScale6};
    font-weight: 800;
    margin-bottom: 10px;
`
const SubText = styled.Text`
    font-size: 16px;
    color: ${(props) => props.theme.colors.greyScale5};
    text-align: center;
`
