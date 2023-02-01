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
                heightAndWidth={'14px'}
                color={'white'}
                strokeWidth={'3px'}
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
    color: white;
    font-size: 12px;
    margin-left: 10px;
    font-weight: 600;
`

const Container = styled.TouchableOpacity`
    position: relative;
    display: flex;
    width: 100%;
    align-items: center;
    border-radius: 30px;
    z-index: 10000;
    background: ${(props) => props.theme.colors.prime1};
    width: 180px;
    height: 30px;
    border-radius: 30px;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`
