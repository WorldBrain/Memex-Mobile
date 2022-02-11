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
    console.log(props.context)

    return (
        <Container>
            <TextBox>
                <TextInputContainer
                    value={props.value}
                    onChangeText={props.onChange}
                    textAlignVertical="top"
                    placeholder="Add Note"
                    editable={!props.disabled}
                    placeholderTextColor={'#3a2f45B3'}
                    multiline
                    autoFocus
                />
            </TextBox>
        </Container>
    )
}

const Container = styled.SafeAreaView`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
`

const TextBox = styled.View`
    background: white;
    border-radius: 8px;
    height: 100%;
    width: 100%;
    flex: 1;
    border: none;
    width: 620px;
    max-width: 100%;
`

const TextInputContainer = styled.TextInput`
    padding: 20px 20px 100px 20px;
    flex: 1;
    font-size: 15px;
`

export default NoteInput
