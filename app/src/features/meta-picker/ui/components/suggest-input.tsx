import React from 'react'
import styled from 'styled-components/native'
import { theme } from 'src/ui/components/theme/theme'
import { ColorThemeKeys } from '@worldbrain/memex-common/lib/common-ui/styles/types'

export interface Props {
    value: string
    placeholder: string
    onChange: (text: string) => void
    background: ColorThemeKeys
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
            placeholderTextColor={theme.colors.greyScale5}
            autoCapitalize="none"
            autoFocus
            background={props.background}
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

const TextInputContainer = styled.TextInput<{ background: ColorThemeKeys }>`
    background: ${(props) =>
        props.background
            ? props.theme.colors[props.background]
            : props.theme.colors.greyScale1};
    border-radius: 8px;
    flex: 1;
    height: 100%;
    padding: 0 20px;
    color: ${(props) => props.theme.colors.greyScale6};
`
