import React from 'react'

import Modal from 'react-native-modalbox'
import { css } from 'styled-components'
import styled from 'styled-components/native'
import { DeviceDetails } from '../screens/share-modal/util'

export interface Props {
    isModalShown: boolean
    stretched?: boolean
    onClosed: () => void
    height: number
    deviceInfo: DeviceDetails | null
}

const ShareModal: React.StatelessComponent<Props> = (props) => (
    <ModalContainer
        position="top"
        onClosed={props.onClosed}
        isOpen={props.isModalShown}
        backdropPressToClose={false}
        swipeToClose={false}
    >
        <ModalContent
            deviceOrientation={
                props.deviceInfo?.deviceOrientation || 'portrait'
            }
            os={props.deviceInfo?.isIos ? 'iOS' : 'Android'}
            deviceType={props.deviceInfo?.isPhone ? 'phone' : 'tablet'}
            height={Math.floor(
                props.deviceInfo?.heightWithoutNavigationBar ||
                    props.deviceInfo?.height ||
                    0,
            )}
        >
            {props.children}
        </ModalContent>
    </ModalContainer>
)

const ModalContainer = styled(Modal)`
    background: ${(props) => props.theme.colors.greyScale1};
`

// if portrait, full height
// if landscape, full width and height

const ModalContent = styled.View<{
    height: number
    deviceOrientation: 'portrait' | 'landscape'
    os: 'iOS' | 'Android'
    deviceType: 'phone' | 'tablet'
}>`
    flex: 1;
    flex-direction: column;
    background: ${(props) => props.theme.colors.greyScale1};
    justify-content: flex-start;
    position: absolute;
    left: 5px;
    right: 5px;
    top: 5px;
    overflow: hidden;
    border: none;

    ${(props) =>
        props.os === 'iOS' &&
        css<any>`
            ${(props) =>
                props.deviceOrientation === 'portrait' &&
                css<any>`
                    border-radius: 6px;
                    overflow: hidden;
                    max-height: ${(props) =>
                        props.deviceType === 'phone' ? '92%' : '80%'};
                    height: ${(props) => props.height}px;
                `};
            ${(props) =>
                props.deviceOrientation === 'landscape' &&
                css<any>`
                    max-height: ${(props) =>
                        props.deviceType === 'phone' ? '100%' : '88%'};
                    height: ${(props) => props.height}px;
                    border-radius: 10px;
                    overflow: hidden;
                `};
        `};
    ${(props) =>
        props.os === 'Android' &&
        css<any>`
            ${(props) =>
                props.deviceOrientation === 'portrait' &&
                css<any>`
                    height: ${(props) => props.height}px;
                    max-height: ${(props) =>
                        props.deviceType === 'phone' ? '95%' : '80%'};
                `};
            ${(props) =>
                props.deviceOrientation === 'landscape' &&
                css<any>`
                    height: ${(props) => props.height}px;
                    max-height: ${(props) =>
                        props.deviceType === 'phone' ? '100%' : '88%'};
                    max-height: 80%;
                `};
        `};
`

export default ShareModal
