import React from 'react'
import styled from 'styled-components/native'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import { privacyLevelToIcon, privacyLevelToText } from '../utils'
import type { ActionSheetServiceInterface } from 'src/services/action-sheet/types'
import { Globe, Person } from './icons/icons-list'

export interface Props {
    hasSharedLists?: boolean
    level: AnnotationPrivacyLevels
    actionSheetService: ActionSheetServiceInterface
    onPrivacyLevelChoice: (level: AnnotationPrivacyLevels) => void
}

const AnnotationPrivacyBtn: React.SFC<Props> = ({
    level,
    hasSharedLists,
    actionSheetService,
    onPrivacyLevelChoice,
}) => {
    const onShowSheet = () =>
        actionSheetService.show({
            // title: 'Change Privacy of Note',
            hideOnSelection: true,
            actions: [
                {
                    key: 'public',
                    title: 'Public',
                    icon: Globe,
                    subtitle: 'Added to all Shared Spaces you put the page in',
                    onPress: () =>
                        onPrivacyLevelChoice(AnnotationPrivacyLevels.SHARED),
                },
                {
                    key: 'private',
                    title: 'Private',
                    icon: Person,
                    subtitle: 'Only visible to you',
                    onPress: () =>
                        onPrivacyLevelChoice(AnnotationPrivacyLevels.PRIVATE),
                },
                // {
                //     key: 'protected',
                //     title: 'Protected',
                //     subtitle: 'Does not change privacy in bulk changes',
                //     onPress: () =>
                //         onPrivacyLevelChoice(AnnotationPrivacyLevels.PROTECTED),
                // },
            ],
            selectedOnLoad: level === 200 ? 'public' : 'private',
        })

    return (
        <PrivacyButton onPress={onShowSheet}>
            <Icon
                icon={privacyLevelToIcon(level, hasSharedLists ?? false)}
                strokeWidth="0px"
                heightAndWidth="18px"
                fill
                color="greyScale5"
            />
            <PrivacyText>
                {privacyLevelToText(level, hasSharedLists ?? false)}
            </PrivacyText>
        </PrivacyButton>
    )
}

export default AnnotationPrivacyBtn

const PrivacyButton = styled.TouchableOpacity`
    display: flex;
    justify-content: space-between;
    width: auto;
    align-items: center;
    flex-direction: row;
    height: 30px;
    padding: 2px 8px;
    margin-right: 10px;
`

const PrivacyText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale5};
    font-size: 12px;
    display: flex;
    margin-left: 5px;
    align-items: flex-end;
    flex-direction: row;
    justify-content: center;
`
