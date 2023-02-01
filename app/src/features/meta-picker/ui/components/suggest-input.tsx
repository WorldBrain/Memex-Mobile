import React from 'react'
import { TextInput, View } from 'react-native'
import styled from 'styled-components/native'
import styles from './suggest-input.styles'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import { theme } from 'src/ui/components/theme/theme'

export interface Props {
    value: string
    placeholder: string
    onChange: (text: string) => void
}

const SuggestInput: React.StatelessComponent<Props> = (props) => (
    <Container>
        {/* <Icon
            icon={icons.Search}
            heightAndWidth={'20px'}
        /> */}
        <TextInputContainer
            value={props.value}
            onChangeText={props.onChange}
            placeholder={props.placeholder}
            placeholderTextColor={theme.colors.lighterText}
            autoCapitalize="none"
            autoFocus
        />
    </Container>
)

export default SuggestInput

const Container = styled.View`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    max-width: 500px;
    height: 50px;
`

const TextInputContainer = styled.TextInput`
    background: ${(props) => props.theme.colors.greyScale2};
    border-radius: 8px;
    flex: 1;
    height: 100%;
    padding: 0 20px;
    color: ${(props) => props.theme.colors.greyScale6};
`
