import React from 'react'
import { View, TouchableWithoutFeedback } from 'react-native'

import Container from './result-container'
import Body, { Props as BodyProps } from './result-note-body'
import { DeleteActionBarBtn, EditNoteActionBarBtn } from './action-btns'
import Tags from './result-page-tags'
import { TouchEventHandler } from 'src/ui/types'
import styles from './result-note.styles'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'

import styled from 'styled-components/native'

export interface Props extends BodyProps {
    isStarred?: boolean
    tags: string[]
}

export interface InteractionProps {
    clearBackground?: boolean
    isNotePressed: boolean
    onDeletePress: TouchEventHandler
    onEditPress: TouchEventHandler
    onNotePress: TouchEventHandler
    hideFooter?: boolean
}

const ResultNote: React.StatelessComponent<Props & InteractionProps> = (
    props,
) => {
    return (
        <NoteContainer>
            <TopArea>
                {/* <TouchableWithoutFeedback onPress={props.onNotePress}> */}
                <ContentContainer>
                    {props.noteText && (
                        <AnnotationContainer>
                            <AnnotationHighlight>
                                {props.noteText}
                            </AnnotationHighlight>
                        </AnnotationContainer>
                    )}
                    {!(!props.commentText || !props.noteText) && (
                        <AnnotationSpacing />
                    )}
                    {props.commentText && (
                        <AnnotationNote>{props.commentText}</AnnotationNote>
                    )}
                </ContentContainer>
                {/* </TouchableWithoutFeedback> */}
            </TopArea>
            <Footer>
                <DateBox>{props.date}</DateBox>
                <ActionBar>
                    <IconContainer onPress={props.onEditPress}>
                        <Icon
                            icon={icons.Edit}
                            strokeWidth={'2px'}
                            heightAndWidth={'16px'}
                        />
                    </IconContainer>
                    <IconContainer onPress={props.onDeletePress}>
                        <Icon icon={icons.Trash} heightAndWidth={'16px'} />
                    </IconContainer>
                </ActionBar>
            </Footer>
        </NoteContainer>
    )
}

const ContentContainer = styled.View`
    padding: 15px 15px 15px 15px;
`

const AnnotationContainer = styled.View`
    padding-left: 10px;
    border-left-color: ${(props) => props.theme.colors.purple + '80'};
    border-left-width: 5px;
    border-style: solid;
`

const AnnotationSpacing = styled.View`
    height: 15px;
`

const AnnotationHighlight = styled.Text`
    color: ${(props) => props.theme.colors.darkerText};
    font-size: 14px;
    line-height: 18px;
`

const AnnotationNote = styled.Text`
    color: ${(props) => props.theme.colors.darkerText};
    font-size: 14px;
`

const DateBox = styled.Text`
    color: ${(props) => props.theme.colors.lighterText};
`

const ActionBar = styled.View`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    flex: 1;
`

const NoteContainer = styled.View`
    background: white;
    margin: 10px 0px 0 0;
    shadow-opacity: 0.5;
    shadow-radius: 5px;
    shadow-color: #e0e0e0;
    shadow-offset: 0px 2px;
    border-radius: 8px;
    background: white;
    width: 100%;
`

const TopArea = styled.TouchableOpacity``

const IconContainer = styled.TouchableOpacity`
    margin-left: 15px;
`

const Footer = styled.View`
    height: 40px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-top-width: 1px;
    border-top-color: #f0f0f0;
    border-style: solid;
    padding: 0 15px;
`

export default ResultNote
