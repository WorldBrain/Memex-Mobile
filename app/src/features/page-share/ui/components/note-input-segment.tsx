import React, { useState, useEffect } from 'react'
import styled from 'styled-components/native'
import QuillEditor, { QuillToolbar } from 'react-native-cn-quill'
import { StyleSheet } from 'react-native'
import LoadingBalls from 'src/ui/components/loading-balls'
import { theme } from 'src/ui/components/theme/theme'

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
    const [renderEditor, setRenderEditor] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setRenderEditor(true)
        }, 500) // 1000ms delay

        return () => clearTimeout(timer) // cleanup on unmount
    }, [])

    const styles = StyleSheet.create({
        editor: {
            flex: 1,
            padding: 0,
            borderColor: 'gray',
            borderWidth: 1,
            marginHorizontal: 30,
            marginVertical: 5,
            backgroundColor: 'white',
            fontSize: 16,
        },
    })

    return (
        <Container>
            <TextBox>
                {renderEditor ? (
                    <QuillEditor
                        initialHtml={props.initNote}
                        onHtmlChange={({ html }) => {
                            props.onChange(html)
                        }}
                        quill={{
                            modules: {
                                toolbar: [
                                    'bold',
                                    'italic',
                                    'underline',
                                    'strike',
                                    { header: 1 },
                                    { header: 2 },
                                    { list: 'ordered' },
                                    { list: 'bullet' },
                                ],
                            },
                            placeholder: 'Write your note here!',
                        }}
                        customStyles={[
                            `a { color: ${theme.colors.prime1}; text-decoration-line: none; }`,
                            `p { color: ${theme.colors.black}; font-size: 16px; }`,
                            `h1 { font-size: 20px; }`,
                            `h2 { font-size: 18px; }`,
                            `h3 { font-size: 14px; }`,
                            `h4 { font-size: 12px; }`,
                            `h5 { font-size: 12px; }`,
                            `table { border-radius: 8px; border-color: ${theme.colors.greyScale2}; border-width: 1px; width: 100%; }`,
                            `th { padding: 8px 10px; color: ${theme.colors.black}; border-bottom-color: ${theme.colors.greyScale2}; border-bottom-width: 1px; }`,
                            `td { padding: 8px 10px; color: ${theme.colors.black}; border-bottom-color: ${theme.colors.greyScale2}; border-bottom-width: 1px; border-left-color: ${theme.colors.greyScale2}; border-left-width: 1px; }`,
                        ]}
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
