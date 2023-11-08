import React from 'react'
import { theme } from 'src/ui/components/theme/theme'
import styled from 'styled-components/native'

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
                    placeholderTextColor={theme.colors.greyScale6}
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
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
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
