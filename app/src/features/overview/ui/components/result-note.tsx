import React from 'react'
import type { Props as BodyProps } from './result-note-body'
import { TouchEventHandler } from 'src/ui/types'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'
import AddToSpacesBtn from 'src/ui/components/add-to-spaces-btn'
import SpacePill from 'src/ui/components/space-pill'
import type { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import type { List } from 'src/features/meta-picker/types'
import type { ActionSheetServiceInterface } from 'src/services/action-sheet/types'
import type { AutoPk } from '@worldbrain/memex-common/lib/storage/types'
import { RenderHTML } from 'src/ui/utils/RenderHTML'
import { theme } from 'src/ui/components/theme/theme'

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
    onDeletePress: TouchEventHandler
    onAddSpacesPress: TouchEventHandler
    privacyLevel: AnnotationPrivacyLevels
    actionSheetService?: ActionSheetServiceInterface
}

const ResultNote: React.StatelessComponent<Props> = (props) => {
    return (
        <NoteContainer>
            <TopArea onPress={props.onEditPress}>
                <ContentContainer>
                    {props.noteText ? (
                        <AnnotationContainer>
                            <VerticalBar />
                            <HTMLRenderBox>
                                {RenderHTML(props.noteText)}
                            </HTMLRenderBox>
                        </AnnotationContainer>
                    ) : null}
                    {(props.noteText && props.commentText) ||
                    (props.commentText && !props.noteText) ? (
                        <AnnotationSpacing />
                    ) : null}
                    {props.commentText ? (
                        <NoteRenderBox>
                            {RenderHTML(props.commentText)}
                        </NoteRenderBox>
                    ) : null}
                </ContentContainer>
                {props.commentText && props.spaces?.length > 0 ? (
                    <AnnotationSpacing height={10} />
                ) : null}
                {props.spaces?.length > 0 && (
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
            </TopArea>
            <Section>
                <ActionBar>
                    <LeftSide>
                        {/* <AnnotationPrivacyBtn
                            level={props.privacyLevel}
                            hasSharedLists={props.hasSharedLists}
                            onPrivacyLevelChoice={props.onPrivacyLevelSet}
                            actionSheetService={props.actionSheetService}
                        /> */}
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

const MarkDownStyles = {
    body: {
        color: `${theme.colors.white}`,
        paddingLeft: 15,
        paddingRight: 15,
    },
    link: {
        color: `${theme.colors.prime1}`,
        textDecorationLine: 'none',
    },
    heading1: {
        fontSize: 18,
        marginBottom: 5,
    },
    heading2: {
        fontSize: 16,
        marginBottom: 5,
    },
    heading3: {
        fontSize: 14,
        marginBottom: 5,
    },
    heading4: {
        fontSize: 12,
        marginBottom: 5,
    },
    heading5: {
        fontSize: 12,
        marginBottom: 5,
    },
    list_item: {
        marginLeft: 0,
        paddingLeft: 0,
    },
    bullet_list_icon: {
        backgroundColor: '#ffffff',
        height: 3,
        width: 3,
        display: 'flex',
        alignSelf: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    table: {
        borderRadius: 8,
        borderColor: `${theme.colors.greyScale2}`,
        borderWidth: 1,
        width: '100%',
    },
    th: {
        padding: 8,
        color: `${theme.colors.white}`,
        borderBottomColor: `${theme.colors.greyScale2}`,
        borderBottomWidth: 1,
    },
    td: {
        padding: 8,
        color: `${theme.colors.white}`,
        borderBottomColor: `${theme.colors.greyScale2}`,
        borderBottomWidth: 1,
        borderLeftColor: `${theme.colors.greyScale2}`,
        borderLeftWidth: 1,
    },
}

const LeftSide = styled.View`
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    padding-left: 10px;
`
const RightSide = styled.View`
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: flex-end;
    margin-right: -5px;
`

const NoteRenderBox = styled.View`
    width: 95%;
    margin: 5px 15px 0 15px;
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-bottom: -20px;
`

const HTMLRenderBox = styled.View`
    padding: 0px 0px;
    width: 50%;
    flex: 1;
`

const ContentContainer = styled.View`
    padding: 0px 10px 15px 0px;
    display: flex;
    flex-direction: column;
`

const AnnotationContainer = styled.View`
    margin: 0px 0px 0px 0px;
    padding: 15px 15px 5px 15px;
    border-radius: 8px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
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

const AnnotationSpacing = styled.View<{ height?: number }>`
    height: ${(props) => props.height ?? 5}px;
`

const DateBox = styled.Text`
    color: ${(props) => props.theme.colors.greyScale4};
    font-size: 12px;
    margin: 0px 0px;
    font-family: 'Satoshi';
`

const ActionBar = styled.View`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`

const NoteContainer = styled.View`
    margin: 10px 0px 0 0;
    border-radius: 8px;
    background: ${(props) =>
        props.theme.variant === 'dark'
            ? props.theme.colors.greyScale1
            : props.theme.colors.greyScale3}96;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
`

const TopArea = styled.TouchableOpacity`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
`

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
    padding: 0px 10px 0px 10px;
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
    height: 40px;
`

export default ResultNote
