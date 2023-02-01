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
    // const [orientation , setOrientation] = useState(true);

    // useEffect(() => {
    //     console.log("Effect Run");
    //     Dimensions.addEventListener('change', () => {
    //         setOrientation(orientationInfo.portrait ? true : false);
    //     })
    // })

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
    flex: 1;
    //padding-top: ${
        conditionalStyles() === 'tabletLandscape'
            ? '0rem'
            : conditionalStyles() === 'tabletPortrait'
            ? '2rem'
            : '5rem'
    }
`

const ImgContainer = styled.View`
    flex: 3;
    flex-direction: column;
    position: relative;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    max-height: 45%;
`

const TitleContainer = styled.View``

const HeadingText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale6};
    font-size: 24px;
    font-weight: 800;
    text-align: center;
    margin-bottom: 10px;
`

const SecondaryText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale5};
    font-size: 20px;
    font-weight: 400;
    text-align: center;
    margin-bottom: 10px;
    padding: 0 20px;
`

export default OnboardingFeature
