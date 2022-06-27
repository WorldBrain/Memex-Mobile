import React from 'react'
import { View, Text } from 'react-native'
import type { UIPage } from '../../types'
import styles from './result-page-body.styles'

import styled from 'styled-components/native'

export interface Props extends UIPage {
    date: string | undefined
}

const ResultPageBody: React.StatelessComponent<Props> = (props) => (
    <View>
        <ContentBox>
            <Title>
                <TitleText>{props.titleText}</TitleText>
            </Title>
            <BottomBarBox>
                {props.type !== 'page' && (
                    <Text style={styles.pdfIcon}>PDF</Text>
                )}
                <DomainText numberOfLines={1}>{props.domain}</DomainText>
                <DateText>{props.date}</DateText>
            </BottomBarBox>
        </ContentBox>
    </View>
)

export default ResultPageBody

const ContentBox = styled.View`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
`

const Title = styled.View`
    margin-bottom: 5px;
`

const TitleText = styled.Text`
    color: ${(props) => props.theme.colors.darkerText}
    font-weight: 700;
    font-size: 16px;

`

const DomainText = styled.Text`
    color: ${(props) => props.theme.colors.normalText}
    font-weight: 500;
    font-size: 14px;
    margin-right: 10px;
`

const BottomBarBox = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`

const DateText = styled.Text`
    color: ${(props) => props.theme.colors.lighterText}
    font-weight: 400;
    font-size: 14px;
`
