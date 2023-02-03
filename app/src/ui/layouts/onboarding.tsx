import React from 'react'
import { View } from 'react-native'

import ProgressBalls from 'src/ui/components/progress-balls'
import Button from 'src/ui/components/memex-btn'
import EmptyLayout from './empty'
import styles from './onboarding.styles'
import { PrimaryAction } from '../utils/ActionButtons'
import styled from 'styled-components/native'
export interface Props {
    onBackPress: () => void
    onNextPress: () => void
    onSkipPress: () => void
    screenIndex: number
    showBackBtn?: boolean
    children: React.ReactNode
}

const OnboardingLayout: React.StatelessComponent<Props> = (props) => (
    <EmptyLayout style={styles.background}>
        {props.children}

        <View style={styles.mainContainer}>
            <ProgressBalls
                count={2}
                key={props.screenIndex}
                selectedIndex={props.screenIndex}
            />

            {props.screenIndex === 1 ? (
                <ButtonContainer>
                    <LeftArea>
                        <PrimaryAction
                            onPress={props.onBackPress}
                            type="forth"
                            size="medium"
                            label="Back"
                        />
                    </LeftArea>
                    <CenterArea>
                        <PrimaryAction
                            label="Sign Up"
                            onPress={props.onSkipPress}
                            type="tertiary"
                            size="large"
                        />
                    </CenterArea>
                    <RightArea>
                        <PrimaryAction
                            onPress={props.onSkipPress}
                            type="forth"
                            size="medium"
                            label="Skip"
                        />
                    </RightArea>
                </ButtonContainer>
            ) : (
                <ButtonContainer>
                    <LeftArea>
                        {props.showBackBtn && (
                            <PrimaryAction
                                onPress={props.onBackPress}
                                type="forth"
                                size="medium"
                                label="Back"
                            />
                        )}
                    </LeftArea>
                    <CenterArea>
                        <PrimaryAction
                            label="Next"
                            onPress={props.onNextPress}
                            type="tertiary"
                            size="large"
                        />
                    </CenterArea>
                    <RightArea>
                        <PrimaryAction
                            onPress={props.onSkipPress}
                            type="forth"
                            size="medium"
                            label="Skip"
                        />
                    </RightArea>
                </ButtonContainer>
            )}
        </View>
    </EmptyLayout>
)

const ButtonContainer = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    margin-top: 30px;
`

const LeftArea = styled.View`
    display: flex;
    width: 25%;
`

const CenterArea = styled.View`
    display: flex;
    width: 50%;
`

const RightArea = styled.View`
    display: flex;
    width: 25%;
`

export default OnboardingLayout
