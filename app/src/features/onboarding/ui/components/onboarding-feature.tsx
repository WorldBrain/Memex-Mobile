import React, { useState, useEffect } from 'react'
import { View, Text, Image, Dimensions, Platform } from 'react-native'
import { useDeviceOrientation } from '@react-native-community/hooks'
import styled from 'styled-components/native'
import conditionalStyles from 'src/utils/device-size-helper'

import styles from './onboarding-feature.styles'
export interface Props {
    optional?: string
    headingText: string
    secondaryText: string
}

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

const OnboardingFeature = (props) => {
    const orientation = useDeviceOrientation()

    return (
        <MainContainer>
            <ImgContainer>{props.children}</ImgContainer>
            <TitleContainer>
                <HeadingText>{props.headingText}</HeadingText>
                <SecondaryText>{props.secondaryText}</SecondaryText>
            </TitleContainer>
        </MainContainer>
    )
}

const MainContainer = styled.View`
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
    justify-content: center;
    background: ${(props) => props.theme.colors.black};
    flex: 1;
`

const ImgContainer = styled.View`
    flex: 2;
    flex-direction: column;
    position: relative;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    max-height: 45%;
`

const TitleContainer = styled.View``

const HeadingText = styled.Text`
    color: ${(props) => props.theme.colors.white};
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 10px;
    font-family: 'Satoshi';
`

const SecondaryText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale6};
    font-size: 16px;
    font-weight: 300;
    text-align: center;
    margin-bottom: 80px;
    padding: 0 20px;
    line-height: 24px;
    font-family: 'Satoshi';
`

export default OnboardingFeature
