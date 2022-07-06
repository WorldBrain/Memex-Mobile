import React from 'react'
import type { GestureResponderEvent } from 'react-native'
import styled from 'styled-components/native'
import { Plus as PlusIcon } from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'

export interface Props {
    onPress: (e: GestureResponderEvent) => void
    spaceCount?: number
}

const AddToSpacesBtn: React.SFC<Props> = ({ spaceCount = 0, onPress }) => (
    <AddSpacesContainer onPress={onPress}>
        {spaceCount === 0 ? (
            <Icon
                icon={PlusIcon}
                color="purple"
                strokeWidth="2px"
                heightAndWidth="14px"
            />
        ) : (
            <SpacesCounterPill>
                <SpacesCounterText>{spaceCount}</SpacesCounterText>
            </SpacesCounterPill>
        )}
        <AddSpacesText>Add to Spaces</AddSpacesText>
    </AddSpacesContainer>
)

export default React.memo(
    AddToSpacesBtn,
    (prevProps, nextProps) => prevProps.spaceCount != nextProps.spaceCount,
)

const AddSpacesContainer = styled.TouchableOpacity`
    border-width: 2px;
    border-style: dotted;
    border-color: ${(props) => props.theme.colors.lightgrey}
    display: flex;
    justify-content: space-between;
    width: 124px;
    align-items: center;
    flex-direction: row;
    text-align-vertical: center;
    height: 30px;
    padding: 2px 8px;
`

const AddSpacesText = styled.Text`
    color: ${(props) => props.theme.colors.purple};
    font-size: 12px;
    display: flex;
    align-items flex-end;
    flex-direction: row;
    justify-content: center;
    text-align-vertical: bottom;
`

const SpacesCounterPill = styled.View`
    padding: 1px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: ${(props) => props.theme.colors.purple}
    border-radius: 50px;
    margin-right: 5px;
`

const SpacesCounterText = styled.Text`
    color: white;
    font-weight: 600;
    text-align: center;
    font-size: 12px;
`
