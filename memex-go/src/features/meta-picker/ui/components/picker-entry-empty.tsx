import React from 'react'
import { View, Text } from 'react-native'
import { Reload, SpacesEmtpy } from 'src/ui/components/icons/icons-list'
import { SectionCircle } from 'src/ui/utils/SectionCircle'
import styled from 'styled-components/native'

import styles from './picker-entry.styles'

export interface Props {
    hasSearchInput: boolean
}

const MetaPickerEmptyRow: React.StatelessComponent<Props> = (props) => (
    <Container>
        {SectionCircle(40, SpacesEmtpy)}
        <EmptyRowText>
            {props.hasSearchInput
                ? `No matching Space found`
                : `No Spaces exist yet`}
        </EmptyRowText>
    </Container>
)

const Container = styled.View`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 30px;
`

const EmptyRowText = styled.Text`
    font-size: 16px;
    color: ${(props) => props.theme.colors.greyScale6};
    font-weight: 500;
    margin-top: 10px;
    font-family: 'Satoshi';
`

export default MetaPickerEmptyRow
