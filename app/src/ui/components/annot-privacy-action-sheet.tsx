import React from 'react'
import styled from 'styled-components/native'
import ActionSheet, {
    SheetManager,
    SheetProps,
    registerSheet,
} from 'react-native-actions-sheet'
import { AnnotationPrivacyLevels } from '@worldbrain/memex-common/lib/annotations/types'

const AnnotationPrivacyActionSheet: React.SFC<SheetProps> = ({ sheetId }) => {
    let onPrivacyLevelChoice!: (level: AnnotationPrivacyLevels) => Promise<void>
    const handleChoice = (level?: AnnotationPrivacyLevels) => async () => {
        if (level != null && onPrivacyLevelChoice != null) {
            await onPrivacyLevelChoice(level)
        }
        SheetManager.hide(sheetId)
    }

    return (
        <ActionSheet
            id={sheetId}
            onBeforeShow={(data: any) => {
                onPrivacyLevelChoice = data.onPrivacyLevelChoice
            }}
        >
            <ChoiceList>
                <Choice onPress={handleChoice(AnnotationPrivacyLevels.SHARED)}>
                    <Text>Public</Text>
                </Choice>
                <Choice onPress={handleChoice(AnnotationPrivacyLevels.PRIVATE)}>
                    <Text>Private</Text>
                </Choice>
                <Choice
                    onPress={handleChoice(AnnotationPrivacyLevels.PROTECTED)}
                >
                    <Text>Protected</Text>
                </Choice>
                <Choice onPress={handleChoice()}>
                    <Text>Cancel</Text>
                </Choice>
            </ChoiceList>
        </ActionSheet>
    )
}

registerSheet('annotation-privacy-sheet', AnnotationPrivacyActionSheet)

export default AnnotationPrivacyActionSheet

const ChoiceList = styled.View``

const Choice = styled.TouchableOpacity`
    height: 26px;
`

const Text = styled.Text`
    text-align: center;
`
