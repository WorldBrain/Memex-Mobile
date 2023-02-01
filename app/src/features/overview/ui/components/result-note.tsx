import React from 'react'
import { Share, Platform } from 'react-native'
import type { Props as BodyProps } from './result-note-body'
import { TouchEventHandler } from 'src/ui/types'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'
import AddToSpacesBtn from 'src/ui/components/add-to-spaces-btn'
import SpacePill from 'src/ui/components/space-pill'
import AnnotationPrivacyBtn from 'src/ui/components/annot-privacy-btn'
import type { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import type { List } from 'src/features/meta-picker/types'
import type { ActionSheetServiceInterface } from 'src/services/action-sheet/types'
import type { AutoPk } from '@worldbrain/memex-common/lib/storage/types'
import { getNoteShareUrl } from '@worldbrain/memex-common/lib/content-sharing/utils'

export interface Props extends BodyProps, InteractionProps {
    isStarred?: boolean
    remoteId?: AutoPk
    spaces: List[]
}

export interface InteractionProps {
    hideFooter?: boolean
    isNotePressed: boolean
    hasSharedLists: boolean
    clearBackground?: boolean
    onEditPress: TouchEventHandler
    onNotePress: TouchEventHandler
    onDeletePress: TouchEventHandler
    onAddSpacesPress: TouchEventHandler
    privacyLevel: AnnotationPrivacyLevels
    actionSheetService: ActionSheetServiceInterface
    onPrivacyLevelSet: (level: AnnotationPrivacyLevels) => void
}

const ResultNote: React.StatelessComponent<Props> = (props) => {
    return (
        <NoteContainer>
            <TopArea onPress={props.onEditPress}>
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
            {props.spaces.length > 0 && (
                <Section>
                    <SpaceList>
                        {props.spaces.map((space) => (
                            <SpacePill
                                key={space.id}
                                name={space.name}
                                isShared={space.remoteId != null}
                            />
                        ))}
                    </SpaceList>
                </Section>
            )}
            <Section>
                <AddToSpacesBtn onPress={props.onAddSpacesPress} />
                <ActionBar>
                    {props.remoteId != null && (
                        <IconContainer
                            onPress={async () => {
                                const remoteUrl = getNoteShareUrl({
                                    remoteAnnotationId: props.remoteId!.toString(),
                                })
                                await Share.share({
                                    url: remoteUrl,
                                    message:
                                        Platform.OS === 'ios'
                                            ? undefined
                                            : remoteUrl,
                                })
                            }}
                        >
                            <Icon
                                icon={icons.Copy}
                                strokeWidth={'2px'}
                                heightAndWidth={'16px'}
                            />
                        </IconContainer>
                    )}
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
                    <AnnotationPrivacyBtn
                        level={props.privacyLevel}
                        hasSharedLists={props.hasSharedLists}
                        onPrivacyLevelChoice={props.onPrivacyLevelSet}
                        actionSheetService={props.actionSheetService}
                    />
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
    border-left-color: ${(props) => props.theme.colors.prime1 + '80'};
    border-left-width: 5px;
    border-style: solid;
`

const AnnotationSpacing = styled.View`
    height: 15px;
`

const AnnotationHighlight = styled.Text`
    color: ${(props) => props.theme.colors.greyScale5};
    font-size: 14px;
    line-height: 18px;
`

const AnnotationNote = styled.Text`
    color: ${(props) => props.theme.colors.greyScale5};
    font-size: 14px;
`

const DateBox = styled.Text`
    color: ${(props) => props.theme.colors.greyScale5};
    font-size: 12px;
    margin: -5px 0px;
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
    width: 100%;
    flex-wrap: wrap;
`

const Section = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-top-width: 1px;
    border-top-color: #f0f0f0;
    border-style: solid;
    padding: 5px 10px 5px 15px;
`

export default ResultNote
