import React from 'react'
import { View, Text } from 'react-native'
import type { UIPage } from '../../types'
import styles from './result-page-body.styles'

import styled from 'styled-components/native'

export interface Props extends Pick<UIPage, 'titleText' | 'type' | 'domain'> {
    date: string | undefined
}

const ResultPageBody: React.StatelessComponent<Props> = (props) => (
    <View>
        <ContentBox>
            <Title>
                <TitleText>{props.titleText}</TitleText>
            </Title>
            <BottomBarBox>
                <DomainText>{props.domain}</DomainText>
                {props.type !== 'page' && <PDFPill>PDF</PDFPill>}
            </BottomBarBox>
        </ContentBox>
    </View>
)

export default ResultPageBody

const PDFPill = styled.Text`
    color: ${(props) => props.theme.colors.greyScale4};
    border-radius: 5px;
    border: 1px solid ${(props) => props.theme.colors.greyScale4};
    padding: 2px 5px;
    font-size: 10px;
    margin-right: 10px;
    font-family: 'Satoshi';
`

const ContentBox = styled.View`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    font-family: 'Satoshi';
`

const Title = styled.View`
    margin-bottom: 5px;
`

const TitleText = styled.Text`
    color: ${(props) => props.theme.colors.white};
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 0.3px;
    font-family: 'Satoshi';
`

const DomainText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale5};
    font-weight: 400;
    font-size: 14px;
    margin-right: 10px;
    font-family: 'Satoshi';
`

const BottomBarBox = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`
