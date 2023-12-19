import React from 'react'
import styled from 'styled-components/native'
import QuillEditor, { QuillToolbar } from 'react-native-cn-quill'
import { StyleSheet } from 'react-native'

export interface Props {
    containerClassName?: string
    className?: string
    value: string
    disabled?: boolean
    onChange: (text: string) => void
    initNote?: string
}

const NoteInput: React.StatelessComponent<Props> = (props) => {
    const _editor = React.createRef()

    return (
        <Container>
            <TextBox>
                <QuillToolbar
                    style={styles.toolbar}
                    editor={_editor}
                    theme="light"
                    options={[
                        'bold',
                        'italic',
                        'underline',
                        'strike',
                        { header: 1 },
                        { header: 2 },
                        { list: 'ordered' },
                        { list: 'bullet' },
                    ]}
                />
                <QuillEditor
                    style={styles.editor}
                    ref={_editor}
                    initialHtml={props.initNote}
                    onHtmlChange={({ html }) => {
                        props.onChange(html)
                    }}
                />

                {/* <TextInputContainer
                    value={props.value}
                    onChangeText={props.onChange}
                    textAlignVertical="top"
                    placeholder="Add Note"
                    editable={!props.disabled}
                    placeholderTextColor={theme.colors.greyScale6}
                    multiline
                    autoFocus
                /> */}
            </TextBox>
        </Container>
    )
}

const styles = StyleSheet.create({
    title: {
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    root: {
        flex: 1,
    },
    editor: {
        flex: 1,
        padding: 0,
        backgroundColor: '#191a20',
    },
    toolbar: {
        flex: 1,
        borderRadius: 6,
        backgroundColor: '#191a20',
        color: 'red',
    },
})

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
