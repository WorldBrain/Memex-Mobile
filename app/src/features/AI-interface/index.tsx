import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import styled, { css } from 'styled-components/native'
import { StatefulUIElement } from 'src/ui/types'
import React, { Component } from 'react'
import Markdown from 'react-native-markdown-display'
import * as icons from 'src/ui/components/icons/icons-list'
import LoadingBalls from 'src/ui/components/loading-balls'
import Logic, { State, Event, Props } from './logic'
import { Icon } from 'src/ui/components/icons/icon-mobile'

export class AIResultsComponent extends StatefulUIElement<Props, State, Event> {
    constructor(props: Props) {
        super(props, new Logic(props))
    }

    render() {
        const markdownStyles = StyleSheet.create({
            heading1: {
                fontSize: 32,
                color: '#CACAD1',
                minHeight: 40,
                lineHeight: 40,
            },
            heading2: {
                fontSize: 24,
                color: '#CACAD1',
                lineHeight: 35,
            },
            body: {
                fontSize: 16,
                color: '#CACAD1',
                lineHeight: 24,
                paddingBottom: 40,
            },
            link: {
                color: '#6AE394',
            },
        })

        const DismissKeyboard = (children: any) => (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                {children}
            </TouchableWithoutFeedback>
        )

        const renderAIquerySuggestions = () => {
            const querySuggestions = [
                'Summarize this for me',
                'Tell me the key takeaways',
                `Explain this to me in simple terms`,
                `Translate this into English`,
            ]

            return (
                <AIquerySuggestionsContainer>
                    <AIquerySuggestionsTitle>
                        Prompt Suggestions
                    </AIquerySuggestionsTitle>
                    {querySuggestions.map((query) => (
                        <AiQuerySuggestionsItem
                            onPress={() => {
                                this.processEvent('onAIQuerySubmit', {
                                    prompt: query,
                                    fullPageUrl: this.state.url,
                                })
                            }}
                        >
                            <AiQuerySuggestionsItemText>
                                {query}
                            </AiQuerySuggestionsItemText>
                        </AiQuerySuggestionsItem>
                    ))}
                </AIquerySuggestionsContainer>
            )
        }

        return (
            <AIResultsContainer>
                <TextInputContainer>
                    <Icon
                        icon={icons.Stars}
                        heightAndWidth={'22px'}
                        strokeWidth={'0px'}
                        fill
                        height={'50px'}
                    />
                    <AIQueryField
                        onSubmitEditing={(event) => {
                            this.processEvent('onAIQuerySubmit', {
                                prompt: event.nativeEvent.text,
                                fullPageUrl: this.state.url,
                            })
                        }}
                        style={{
                            textAlignVertical: 'top',
                            alignSelf: 'flex-start',
                        }}
                        onPressIn={() => this.processEvent('clearQuery', null)}
                        placeholder={
                            this.state.prompt ||
                            'Ask a question about this page'
                        }
                        placeholderTextColor={'#A9A9B1'}
                        multiline
                    />
                </TextInputContainer>
                {this.state.AISummaryLoading === 'running' ? (
                    <LoadingContainer>
                        <LoadingBalls />
                    </LoadingContainer>
                ) : this.state.AIsummaryText.length > 0 ? (
                    <DismissKeyboard>
                        <AIResultsTextContainer keyboardShouldPersistTaps="never">
                            <Markdown
                                // keyboardShouldPersistTaps="never"
                                // onLinkPress={(url) => {
                                //     return this.props.runFnInWebView(
                                //         'jumpToTimestamp',
                                //         url,
                                //     )
                                // }}
                                style={markdownStyles}
                            >
                                {this.state.AIsummaryText}
                            </Markdown>
                            <Spacer height={150} />
                        </AIResultsTextContainer>
                    </DismissKeyboard>
                ) : (
                    renderAIquerySuggestions() // Ensure you define this method or remove it if not used
                )}
            </AIResultsContainer>
        )
    }
}

export default AIResultsComponent

const LoadingContainer = styled.SafeAreaView<{
    deviceOrientation?: 'portrait' | 'landscape'
    isLoading?: boolean
    os?: 'iOS' | 'Android'
    AIuiShown?: boolean
    deviceHeight?: number
}>`
    background: ${(props) => props.theme.colors.greyScale1};
    width: 100%;
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    height: 100px;
    ${(props) =>
        props.isLoading
            ? `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    `
            : ''}

    ${(props) =>
        props.os === 'iOS' &&
        css<any>`
            ${(props) =>
                props.deviceOrientation === 'portrait' &&
                css<any>`
                    border-radius: 10px;
                `};
            ${(props) =>
                props.deviceOrientation === 'landscape' &&
                css<any>`
                    border-radius: 50px;
                    width: 110%;
                `};
        `};
    ${(props) =>
        props.os === 'Android' &&
        css<any>`
            ${(props) => props.deviceOrientation === 'portrait' && css<any>``};
            ${(props) =>
                props.deviceOrientation === 'landscape' &&
                css<any>`
                    width: 110%;
                `};
        `};
`

const AIquerySuggestionsTitle = styled.Text`
    color: ${(props) => props.theme.colors.greyScale5};
    font-size: 16px;
    padding: 5px 0;
    margin-bottom: 10px;
`

const AIquerySuggestionsContainer = styled.View`
    display: flex;
    align-items: flex-start;
    justify-content: center;
    width: 100%;
    padding: 10px 20px 0 20px;
`

const AiQuerySuggestionsItem = styled(TouchableOpacity)`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
    border-radius: 5px;
    padding: 5px;
    background: ${(props) => props.theme.colors.greyScale2};
`

const AiQuerySuggestionsItemText = styled.Text`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(props) => props.theme.colors.greyScale6};
    font-size: 14px;
    font-weight: 400;
`

const LoadingBox = styled.SafeAreaView<{}>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 600px;
    height: 100%;
    flex: 1;
`

const TextInputContainer = styled.View<{}>`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    min-height: 50px;
    border-radius: 8px;
    padding: 0 10px;
    margin: 10px;
    border-width: 1px;
    border-radius: 8px;
    border-color: ${(props) => props.theme.colors.greyScale2};
    background: ${(props) => props.theme.colors.greyScale2};

    &:focus-within {
        border-color: ${(props) => props.theme.colors.greyScale3};
    }
`

const AIQueryField = styled.TextInput<{}>`
    background: transparent;
    flex: 1;
    color: ${(props) => props.theme.colors.greyScale6};
    padding: 15px 0 10px 0;
    padding-left: 10px;
    height: 100%;
    display: flex;
    align-items: flex-start;
    align-self: flex-start;
`

const AIResultsContainer = styled.View<{}>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    position: relative;
    z-index: 1000;
    background: ${(props) => props.theme.colors.greyScale1};
    min-height: 30px;
    flex: 1;
`

const AIResultsTextContainer = styled.ScrollView`
    flex: 1;
    width: 100%;
    min-height: 30px;
    padding: 0 20px 0 20px;
`

const Spacer = styled.View<{
    height: number
}>`
    height: ${(props) => props.height}px;
`
