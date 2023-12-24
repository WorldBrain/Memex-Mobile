import React, { useState, useEffect } from 'react'
import styled from 'styled-components/native'
import QuillEditor, { QuillToolbar } from 'react-native-cn-quill'
import { StyleSheet } from 'react-native'
import LoadingBalls from 'src/ui/components/loading-balls'
const LoadingBox = styled.View`
    margin-top: 40px;
`

export interface Props {
    containerClassName?: string
    className?: string
    value: string
    disabled?: boolean
    onChange: (text: string) => void
    initNote?: string
}

const NoteInput: React.StatelessComponent<Props> = (props) => {
    const editor = React.createRef()
    const [renderEditor, setRenderEditor] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setRenderEditor(true)
        }, 500) // 1000ms delay

        return () => clearTimeout(timer) // cleanup on unmount
    }, [])

    return (
        <Container>
            <TextBox>
                <Box>
                    <QuillToolbar
                        editor={editor}
                        theme="dark"
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
                </Box>
                {renderEditor ? (
                    <QuillEditor
                        ref={editor}
                        initialHtml={props.initNote}
                        onHtmlChange={({ html }) => {
                            props.onChange(html)
                        }}
                    />
                ) : (
                    <LoadingBox>
                        <LoadingBalls />
                    </LoadingBox>
                )}
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
    background: ${(props) => props.theme.colors.black};
`

const TextBox = styled.View`
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
    width: 100%;
    flex: 1;
    width: 800px;
    max-width: 100%;
    background: ${(props) => props.theme.colors.black};
`

const Box = styled.View`
    margin-top: -2px;
    margin-left: -2px;
`

export default NoteInput
