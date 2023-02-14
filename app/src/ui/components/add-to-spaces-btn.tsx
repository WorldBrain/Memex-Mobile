import React from 'react'
import type { GestureResponderEvent } from 'react-native'
import styled from 'styled-components/native'
import { Plus as PlusIcon } from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'

export interface Props {
    onPress: (e: GestureResponderEvent) => void
    spaceCount?: number
    mainText?: string
    mini?: boolean
}

const AddToSpacesBtn: React.SFC<Props> = ({
    spaceCount = 0,
    mainText = 'Add to Spaces',
    onPress,
    mini,
}) => (
    <AddSpacesContainer onPress={onPress}>
        <Icon
            icon={PlusIcon}
            color="prime1"
            strokeWidth="0px"
            heightAndWidth="20px"
            fill
        />
        {spaceCount === 0 && !mini ? (
            <AddSpacesText> {mainText}</AddSpacesText>
        ) : (
            <SpacesCounterText>
                {spaceCount > 0 && spaceCount}
            </SpacesCounterText>
        )}
    </AddSpacesContainer>
)

export default React.memo(
    AddToSpacesBtn,
    (prevProps, nextProps) => prevProps.spaceCount != nextProps.spaceCount,
)

const AddSpacesContainer = styled.TouchableOpacity`
    display: flex;
    justify-content: space-between;
    width: auto;
    align-items: center;
    flex-direction: row;
    height: 30px;
    padding: 2px 8px;
    margin-right: 10px;
`

const AddSpacesText = styled.Text`
    color: ${(props) => props.theme.colors.greyScale6};
    font-size: 12px;
    display: flex;
    align-items: flex-end;
    flex-direction: row;
    justify-content: center;
    font-family: 'Satoshi';
`

const SpacesCounterText = styled.Text`
    color: ${(props) => props.theme.colors.white};
    font-weight: 600;
    text-align: center;
    font-size: 12px;
    margin-left: 5px;
    font-family: 'Satoshi';
`
