import React from 'react'
import { Alert } from 'react-native'
import styled from 'styled-components/native'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'
import { privacyLevelToIcon } from '../utils'

export interface Props {
    level: AnnotationPrivacyLevels
    onPrivacyLevelChoice: (
        level: AnnotationPrivacyLevels,
    ) => () => Promise<void>
}

const AnnotationPrivacyBtn: React.SFC<Props> = ({
    level,
    onPrivacyLevelChoice,
}) => (
    <Btn
        onPress={() =>
            Alert.alert(
                'Set annotation privacy level',
                'f',
                [
                    {
                        text: 'Public',
                        onPress: onPrivacyLevelChoice(
                            AnnotationPrivacyLevels.SHARED,
                        ),
                    },
                    {
                        text: 'Private',
                        onPress: onPrivacyLevelChoice(
                            AnnotationPrivacyLevels.PRIVATE,
                        ),
                    },
                    {
                        text: 'Protected',
                        onPress: onPrivacyLevelChoice(
                            AnnotationPrivacyLevels.PROTECTED,
                        ),
                    },
                ],
                {
                    cancelable: true,
                    onDismiss: () => console.log('dmissins!!!'),
                },
            )
        }
    >
        <Icon
            icon={privacyLevelToIcon(level)}
            color="white"
            strokeWidth="2px"
            heightAndWidth="14px"
        />
    </Btn>
)

export default AnnotationPrivacyBtn

const Btn = styled.TouchableOpacity`
    margin: 0 10px;
`
