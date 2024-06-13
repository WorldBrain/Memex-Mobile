import React from 'react'
import styled from 'styled-components/native'
import { theme } from 'src/ui/components/theme/theme'
import { ColorThemeKeys } from '@worldbrain/memex-common/lib/common-ui/styles/types'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import * as icons from 'src/ui/components/icons/icons-list'

export interface Props {
    value: string
    placeholder: string
    onChange: (text: string) => void
    background: ColorThemeKeys
    autoFocus?: boolean
}

const SuggestInput: React.StatelessComponent<Props> = (props) => (
    <Container background={props.background}>
        <IconContainer>
            <Icon icon={icons.Search} heightAndWidth={'20px'} />
        </IconContainer>
        <TextInputContainer
            value={props.value}
            onChangeText={props.onChange}
            placeholder={props.placeholder}
            placeholderTextColor={theme.colors.greyScale5}
            autoCapitalize="none"
            autoFocus={props.autoFocus ?? true}
        />
    </Container>
)

export default SuggestInput

const Container = styled.View<{ background: ColorThemeKeys }>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    width: 100%;
    max-width: 500px;
    height: 50px;
    background: ${(props) =>
        props.background
            ? props.theme.colors[props.background]
            : props.theme.colors.greyScale1};
    border-radius: 8px;
    padding: 0 20px;
`

const IconContainer = styled.View`
    margin-right: 5px;
`

const TextInputContainer = styled.TextInput`
    flex: 1;
    height: 100%;

    color: ${(props) => props.theme.colors.greyScale6};
`
