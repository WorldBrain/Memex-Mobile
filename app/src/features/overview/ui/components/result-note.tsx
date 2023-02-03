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
import { RenderHTML } from 'src/ui/utils/RenderHTML'

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
                            <VerticalBar />
                            <HTMLRenderBox>
                                {RenderHTML(props.noteText)}
                            </HTMLRenderBox>
                            {/* <AnnotationHighlight>
                                {props.noteText}
                            </AnnotationHighlight> */}
                        </AnnotationContainer>
                    )}
                    {((props.noteText && props.commentText) ||
                        (props.commentText && !props.noteText)) && (
                        <AnnotationSpacing />
                    )}
                    {props.commentText && (
                        <AnnotationNote>{props.commentText}</AnnotationNote>
                    )}
                </ContentContainer>
                {/* </TouchableWithoutFeedback> */}
            </TopArea>
            {props.spaces.length > 0 && (
                <SpaceList>
                    {props.spaces.map((space) => (
                        <SpacePill
                            key={space.id}
                            name={space.name}
                            isShared={space.remoteId != null}
                        />
                    ))}
                </SpaceList>
            )}
            <Section>
                <ActionBar>
                    <LeftSide>
                        <AnnotationPrivacyBtn
                            level={props.privacyLevel}
                            hasSharedLists={props.hasSharedLists}
                            onPrivacyLevelChoice={props.onPrivacyLevelSet}
                            actionSheetService={props.actionSheetService}
                        />
                        <DateBox>{props.date}</DateBox>
                    </LeftSide>
                    {/* {props.remoteId != null && (
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
                    )} */}
                    <RightSide>
                        <IconContainer onPress={props.onEditPress}>
                            <Icon
                                icon={icons.Edit}
                                strokeWidth={'0px'}
                                heightAndWidth={'16px'}
                                fill
                            />
                        </IconContainer>
                        <IconContainer onPress={props.onDeletePress}>
                            <Icon
                                icon={icons.Trash}
                                strokeWidth={'0px'}
                                fill
                                heightAndWidth={'16px'}
                            />
                        </IconContainer>
                        <AddToSpacesBtn mini onPress={props.onAddSpacesPress} />
                    </RightSide>
                </ActionBar>
            </Section>
        </NoteContainer>
    )
}

const LeftSide = styled.View`
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
`
const RightSide = styled.View`
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: flex-end;
`

const HTMLRenderBox = styled.View`
    margin: -10px 0px;
    width: 50%;
    flex: 1;
`

const ContentContainer = styled.View`
    padding: 0px 10px 15px 0px;
`

const AnnotationContainer = styled.View`
    margin: 0px 0px 0px 0px;
    padding: 15px 15px 5px 15px;
    border-radius: 8px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    background: ${(props) => props.theme.colors.greyScale1};
`

const VerticalBar = styled.View`
    background: ${(props) => props.theme.colors.prime1};
    border-radius: 3px;
    min-width: 6px;
    max-width: 6px;
    flex: 1;
    height: auto;
    display: flex;
    margin-right: 10px;
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
    color: ${(props) => props.theme.colors.white};
    font-size: 14px;
    padding: 0 15px;
`

const DateBox = styled.Text`
    color: ${(props) => props.theme.colors.greyScale4};
    font-size: 12px;
    margin: 0px 0px;
`

const ActionBar = styled.View`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    flex: 1;
`

const NoteContainer = styled.View`
    margin: 10px 0px 0 0;
    border-radius: 8px;
    background: ${(props) => props.theme.colors.greyScale1};
    width: 100%;
`

const TopArea = styled.TouchableOpacity``

const IconContainer = styled.TouchableOpacity`
    margin-right: 10px;
    margin-left: 10px;
`

const SpaceList = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    flex-wrap: wrap;
    padding: 0px 10px 10px 10px;
`

const Section = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-top-width: 1px;
    border-top-color: ${(props) => props.theme.colors.greyScale2};
    border-style: solid;
    padding: 5px 0px 5px 5px;
`

export default ResultNote
