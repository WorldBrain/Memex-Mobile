import React, { useState } from 'react'
import styled from 'styled-components/native'
import ActionSheet, {
    SheetManager,
    SheetProps,
    registerSheet,
} from 'react-native-actions-sheet'
import type {
    Action,
    ActionSheetShowOptions,
} from 'src/services/action-sheet/types'

const GenericActionSheet: React.FunctionComponent<SheetProps> = ({
    sheetId,
}) => {
    const [options, setOptions] = useState<ActionSheetShowOptions>({
        actions: [],
    })

    const handleChoice = (actionHandler: Action['onPress']) => async () => {
        await actionHandler()
        if (options?.hideOnSelection) {
            SheetManager.hide(sheetId)
        }
    }

    return (
        <ActionSheet
            id={sheetId}
            onBeforeShow={(_options: any) => {
                setOptions(_options)
            }}
        >
            {options?.title && (
                <>
                    <TitleBox>
                        <TitleText>Change Privacy of Note</TitleText>
                    </TitleBox>
                    <Separator />
                </>
            )}
            <ChoiceList>
                {options?.actions.map((action) => (
                    <React.Fragment key={action.key}>
                        <Choice onPress={handleChoice(action.onPress)}>
                            <Text>{action.title}</Text>
                            {action.subtitle && (
                                <SubText>{action.subtitle}</SubText>
                            )}
                        </Choice>
                        <Separator />
                    </React.Fragment>
                ))}
                <Choice onPress={() => SheetManager.hide(sheetId)}>
                    <Text>Cancel</Text>
                </Choice>
            </ChoiceList>
        </ActionSheet>
    )
}

registerSheet('generic-action-sheet', GenericActionSheet)

export default GenericActionSheet

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
    color: ${(props) => props.theme.colors.greyScale5};
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
    color: ${(props) => props.theme.colors.greyScale5};
`

const SubText = styled.Text`
    text-align: left;
    font-size: 14px;
    color: ${(props) => props.theme.colors.greyScale5};
`
