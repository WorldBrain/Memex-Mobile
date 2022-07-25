import React from 'react'
import styled from 'styled-components/native'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import { privacyLevelToIcon } from '../utils'
import type { ActionSheetServiceInterface } from 'src/services/action-sheet/types'

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
            title: 'Change Privacy of Note',
            hideOnSelection: true,
            actions: [
                {
                    key: 'public',
                    title: 'Public',
                    subtitle: 'Added to all Shared Spaces you put the page in',
                    onPress: () =>
                        onPrivacyLevelChoice(AnnotationPrivacyLevels.SHARED),
                },
                {
                    key: 'private',
                    title: 'Private',
                    subtitle: 'Only visible to you',
                    onPress: () =>
                        onPrivacyLevelChoice(AnnotationPrivacyLevels.PRIVATE),
                },
                {
                    key: 'protected',
                    title: 'Protected',
                    subtitle: 'Does not change privacy in bulk changes',
                    onPress: () =>
                        onPrivacyLevelChoice(AnnotationPrivacyLevels.PROTECTED),
                },
            ],
        })

    return (
        <Btn onPress={onShowSheet}>
            <Icon
                icon={privacyLevelToIcon(level, hasSharedLists ?? false)}
                strokeWidth="2px"
                heightAndWidth="16px"
            />
        </Btn>
    )
}

export default AnnotationPrivacyBtn

const Btn = styled.TouchableOpacity`
    margin: 0 10px 0 15px;
`
