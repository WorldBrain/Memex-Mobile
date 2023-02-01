import React from 'react'
import {
    View,
    Text,
    NativeSyntheticEvent,
    NativeTouchEvent,
    Keyboard,
    TouchableOpacity,
} from 'react-native'

import styled from 'styled-components/native'

import styles from './action-bar-segment.styles'

export interface Props {
    showBanner?: boolean
    leftBtnText?: React.ReactNode
    rightBtnText?: React.ReactNode
    renderIndicator?: () => JSX.Element
    onLeftBtnPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
    onRightBtnPress?: (e: NativeSyntheticEvent<NativeTouchEvent>) => void
}

const ActionBar: React.StatelessComponent<Props> = ({
    leftBtnText = 'Cancel',
    rightBtnText = 'Confirm',
    ...props
}) => (
    <>
        {/* {props.showBanner && (
            <View style={[styles.bannerSegmentContainer, styles.bannerSegment]}>
                <Text
                    style={[
                        styles.bannerSegmentText,
                        styles.bannerSegmentTextBold,
                    ]}
                >
                    New:{' '}
                </Text>
                <Text style={styles.bannerSegmentText}>
                    Multi-device sync. Go to the app to set up.
                </Text>
            </View>
        )} */}
        <Container onTouchStart={() => Keyboard.dismiss()}>
            <ButtonContainer>
                {props.onLeftBtnPress ? (
                    <ButtonBox onPress={props.onLeftBtnPress}>
                        {leftBtnText}
                    </ButtonBox>
                ) : (
                    <Text style={styles.placeholderBtn}>Back</Text>
                )}
            </ButtonContainer>
            <View style={styles.mainContent}>{props.children}</View>
            <ButtonContainer>
                {props.renderIndicator?.()}
                <Spacer10 />
                {props.onRightBtnPress ? (
                    <ButtonBox onPress={props.onRightBtnPress}>
                        {rightBtnText}
                    </ButtonBox>
                ) : null}
            </ButtonContainer>
        </Container>
    </>
)

export default ActionBar

const ButtonBox = styled.TouchableOpacity`
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const Spacer10 = styled.View`
    width: 10px;
`

const Container = styled.View`
    display: flex;
    justify-content: space-between;
    padding: 0 15px;
    height: 50px;
    align-items: center;
    flex-direction: row;
    border-style: solid;
    border-top-width: 1px;
    border-color: ${(props) => props.theme.colors.greyScale5};
    background: white;
`

const ButtonContainer = styled.View`
    display: flex;
    flex-direction: row;
    height: 30px;
    width: 30px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
`
