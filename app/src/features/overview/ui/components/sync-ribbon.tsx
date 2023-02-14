import React from 'react'
import { Text, TouchableOpacity, View, Image } from 'react-native'

import styles from './sync-ribbon.styles'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'

export interface Props {
    onPress: () => void
    text: string
}

const SyncRibbon: React.StatelessComponent<Props> = (props) => {
    return (
        <Container onPress={props.onPress}>
            <Icon
                icon={icons.Reload}
                heightAndWidth={'18px'}
                color={'black'}
                strokeWidth={'0px'}
                fill
            />
            <UpdateBox>
                <UpdateText>{props.text}</UpdateText>
            </UpdateBox>
        </Container>
    )
}

export default SyncRibbon

const UpdateBox = styled.View``

const UpdateText = styled.Text`
    color: ${(props) => props.theme.colors.black};
    font-size: 12px;
    margin-left: 10px;
    font-weight: 400;
    font-family: 'Satoshi';
`

const Container = styled.TouchableOpacity`
    position: absolute;
    right: 15px;
    top: 62px;
    display: flex;
    width: 100%;
    align-items: center;
    border-radius: 8px;
    z-index: 10000;
    background: ${(props) => props.theme.colors.prime1};
    width: 180px;
    height: 30px;
    flex-direction: row;
    align-items: center;
    justify-content: center;)
`
