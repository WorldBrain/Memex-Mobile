import React from 'react'
import styled from 'styled-components/native'
import { SheetManager } from 'react-native-actions-sheet'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import { privacyLevelToIcon } from '../utils'

export interface Props {
    level: AnnotationPrivacyLevels
    onPrivacyLevelChoice: (level: AnnotationPrivacyLevels) => void
}

const AnnotationPrivacyBtn: React.SFC<Props> = ({
    level,
    onPrivacyLevelChoice,
}) => (
    <Btn
        onPress={() => {
            SheetManager.show('annotation-privacy-sheet', {
                onPrivacyLevelChoice,
            })
        }}
    >
        <Icon
            icon={privacyLevelToIcon(level)}
            color="white"
            strokeWidth="2px"
            heightAndWidth="16px"
        />
    </Btn>
)

export default AnnotationPrivacyBtn

const Btn = styled.TouchableOpacity`
    margin: 0 10px 0 15px;
`
