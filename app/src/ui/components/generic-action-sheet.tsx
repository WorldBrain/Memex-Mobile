import React, { useState } from 'react'
import styled, { css } from 'styled-components/native'
import ActionSheet, {
    SheetManager,
    SheetProps,
    registerSheet,
} from 'react-native-actions-sheet'
import type {
    Action,
    ActionSheetShowOptions,
} from 'src/services/action-sheet/types'
import { Icon } from './icons/icon-mobile'

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
            bounciness={20}
            defaultOverlayOpacity={0.5}
        >
            <ActionSheetContainer>
                {options?.title && (
                    <>
                        <TitleBox>
                            <TitleText>Change Privacy of Note</TitleText>
                        </TitleBox>
                    </>
                )}
                <ChoiceList>
                    {options?.actions.map((action) => (
                        <React.Fragment key={action.key}>
                            <Choice
                                isSelected={
                                    options.selectedOnLoad === action.key
                                }
                                onPress={handleChoice(action.onPress)}
                            >
                                {action.icon && (
                                    <Icon
                                        icon={action.icon}
                                        strokeWidth="0"
                                        heightAndWidth="24px"
                                        color={
                                            options.selectedOnLoad ===
                                            action.key
                                                ? 'prime1'
                                                : 'greyScale4'
                                        }
                                        fill
                                    />
                                )}
                                <TextContent>
                                    <Text>{action.title}</Text>
                                    {action.subtitle && (
                                        <SubText>{action.subtitle}</SubText>
                                    )}
                                </TextContent>
                            </Choice>
                        </React.Fragment>
                    ))}
                    <CancelButton onPress={() => SheetManager.hide(sheetId)}>
                        <Text>Cancel</Text>
                    </CancelButton>
                </ChoiceList>
            </ActionSheetContainer>
        </ActionSheet>
    )
}

registerSheet('generic-action-sheet', GenericActionSheet)

export default GenericActionSheet

const TextContent = styled.View`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    margin-left: 12px;
`

const ActionSheetContainer = styled.View`
    background: ${(props) => props.theme.colors.black};
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    border-width: 1px;
    border-style: solid;
    border-color: ${(props) => props.theme.colors.greyScale2};
`
const ChoiceList = styled.View`
    padding: 15px;
`

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

const Choice = styled.TouchableOpacity<{
    isSelected?: boolean
}>`
    height: 60px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border-width: 1px;
    border-style: solid;
    border-color: transparent;
    border-radius: 8px;
    display: flex;
    flex-direction: row;

    ${(props) =>
        props.isSelected &&
        css`
            background: ${(props) => props.theme.colors.greyScale1};
        `};
`
const CancelButton = styled.TouchableOpacity`
    height: 60px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    display: flex;
    flex-direction: row;
`

const Text = styled.Text`
    text-align: left;
    font-weight: 500;
    font-size: 14px;
    color: ${(props) => props.theme.colors.white};
    margin-bottom: 5px;
`

const SubText = styled.Text`
    text-align: left;
    font-weight: 300;
    font-size: 12px;
    color: ${(props) => props.theme.colors.greyScale5};
`
