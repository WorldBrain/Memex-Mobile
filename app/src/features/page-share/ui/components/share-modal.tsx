import React from 'react'
import { View, Dimensions } from 'react-native'
import Modal from 'react-native-modalbox'
import styled from 'styled-components/native'

export interface Props {
    isModalShown: boolean
    stretched?: boolean
    onClosed: () => void
    height: number
}

const ShareModal: React.StatelessComponent<Props> = (props) => (
    <ModalContainer
        position="top"
        onClosed={props.onClosed}
        isOpen={props.isModalShown}
        backdropPressToClose={false}
        swipeToClose={false}
    >
        <ModalContent height={props.height}>{props.children}</ModalContent>
    </ModalContainer>
)

const ModalContainer = styled(Modal)`
    background: transparent;
`

const ModalContent = styled.View<{ height: number }>`
    height: ${(props) => props.height}px;
    /* min-height: ${(props) => props.height}px; */
    flex: 1;
    flex-direction: column;
    background: ${(props) => props.theme.colors.greyScale1};
    justify-content: flex-start;
    position: absolute;
    left: 1%;
    right: 1%;
    top: 5px;
    bottom: 200px;
    border-radius: 10px;
    overflow: hidden;
`

export default ShareModal
