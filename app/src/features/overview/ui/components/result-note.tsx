import React from 'react'

import type { Props as BodyProps } from './result-note-body'
import { TouchEventHandler } from 'src/ui/types'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'
import AddToSpacesBtn from 'src/ui/components/add-to-spaces-btn'
import SpacePill from 'src/ui/components/space-pill'

export interface Props extends BodyProps, InteractionProps {
    isStarred?: boolean
    listNames: string[]
}

export interface InteractionProps {
    clearBackground?: boolean
    isNotePressed: boolean
    onDeletePress: TouchEventHandler
    onEditPress: TouchEventHandler
    onNotePress: TouchEventHandler
    onAddSpacesPress: TouchEventHandler
    hideFooter?: boolean
}

const ResultNote: React.StatelessComponent<Props> = (props) => {
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
                    <AnnotationSpacing />
                    <DateBox>{props.date}</DateBox>
                </ContentContainer>
                {/* </TouchableWithoutFeedback> */}
            </TopArea>
            {props.listNames.length > 0 && (
                <Section>
                    <SpaceList>
                        {props.listNames.map((name, i) => (
                            <SpacePill key={`${name}-${i}`} name={name} />
                        ))}
                    </SpaceList>
                </Section>
            )}
            <Section>
                <AddToSpacesBtn onPress={props.onAddSpacesPress} />
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
            </Section>
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
    shadow-color: #d0d0d0;
    shadow-offset: 0px 2px;
    border-radius: 8px;
    background: white;
    width: 100%;
`

const TopArea = styled.TouchableOpacity``

const IconContainer = styled.TouchableOpacity`
    margin-left: 15px;
`

const SpaceList = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

const Section = styled.View`
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
