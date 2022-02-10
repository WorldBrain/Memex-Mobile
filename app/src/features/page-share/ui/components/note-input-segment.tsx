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

const NoteInput: React.StatelessComponent<Props> = (props) => (
    <Container>
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
    </Container>
)

const Container = styled.SafeAreaView`
    height: 100%;
    background: white;
    border-color: ${(props) => props.theme.colors.lightgrey};
    border-style: solid;
    border-radius: 8px;
    border-width: 1px;
    margin: 0px 10px 10px 10px;
    background: white;
`

const TextInputContainer = styled.TextInput`
    padding: 20px;
`

export default NoteInput
