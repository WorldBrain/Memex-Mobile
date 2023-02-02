import { CORE_THEME } from '@worldbrain/memex-common/lib/common-ui/styles/theme'
import React from 'react'
import { View, TextInput } from 'react-native'
import styled from 'styled-components/native'

import styles from './note-input-segment.styles'

export interface Props {
    containerClassName?: string
    className?: string
    value: string
    disabled?: boolean
    onChange: (text: string) => void
}

const NoteInput: React.StatelessComponent<Props> = (props) => {
    return (
        <Container>
            <TextBox>
                <TextInputContainer
                    value={props.value}
                    onChangeText={props.onChange}
                    textAlignVertical="top"
                    placeholder="Add Note"
                    editable={!props.disabled}
                    placeholderTextColor={CORE_THEME().colors.greyScale6}
                    multiline
                    autoFocus
                />
            </TextBox>
        </Container>
    )
}

const Container = styled.SafeAreaView`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
`

const TextBox = styled.View`
    background: ${(props) => props.theme.colors.greyScale1};
    border-radius: 8px;
    height: 100%;
    width: 100%;
    flex: 1;
    border: none;
    width: 800px;
    max-width: 100%;
    color: ${(props) => props.theme.colors.white};

    ::placeholder {
        color: ${(props) => props.theme.colors.greyScale6};
    }
`

const TextInputContainer = styled.TextInput`
    padding: 20px 20px 100px 20px;
    flex: 1;
    font-size: 15px;
    color: ${(props) => props.theme.colors.greyScale6};

    ::placeholder {
        color: ${(props) => props.theme.colors.greyScale6};
    }
`

export default NoteInput
