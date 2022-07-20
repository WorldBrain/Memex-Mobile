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
            <TitleBox>
                <TitleText>Change Privacy of Note</TitleText>
            </TitleBox>
            <Separator />
            <ChoiceList>
                <Choice onPress={handleChoice(AnnotationPrivacyLevels.SHARED)}>
                    <Text>Public</Text>
                    <SubText>
                        Added to all Shared Spaces you put the page in
                    </SubText>
                </Choice>
                <Separator />
                <Choice onPress={handleChoice(AnnotationPrivacyLevels.PRIVATE)}>
                    <Text>Private</Text>
                    <SubText>Only visible to you</SubText>
                </Choice>
                <Separator />
                <Choice
                    onPress={handleChoice(AnnotationPrivacyLevels.PROTECTED)}
                >
                    <Text>Protected</Text>
                    <SubText>Does not change privacy in bulk changes</SubText>
                </Choice>
                <Separator />
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

const TitleBox = styled.View`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 40px;
`

const TitleText = styled.Text`
    text-align: center;
    font-weight: bold;
    font-size: 16px;
    color: ${(props) => props.theme.colors.darkerText};
`

const Choice = styled.TouchableOpacity`
    height: 60px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
`
const Separator = styled.View`
    border-bottom-width: 1px;
    border-bottom-color: #e0e0e0;
`

const Text = styled.Text`
    text-align: left;
    font-weight: bold;
    font-size: 14px;
    color: ${(props) => props.theme.colors.purple};
`

const SubText = styled.Text`
    text-align: left;
    font-size: 14px;
    color: ${(props) => props.theme.colors.lighterText};
`
