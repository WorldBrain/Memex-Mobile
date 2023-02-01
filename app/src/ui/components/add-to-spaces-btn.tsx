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
        {!mini && <AddSpacesText> {mainText}</AddSpacesText>}
    </AddSpacesContainer>
)

export default React.memo(
    AddToSpacesBtn,
    (prevProps, nextProps) => prevProps.spaceCount != nextProps.spaceCount,
)

const AddSpacesContainer = styled.TouchableOpacity`
    border-width: 2px;
    border-style: dotted;
    border-color: ${(props) => props.theme.colors.greyScale5}
    display: flex;
    justify-content: space-between;
    width: auto;
    align-items: center;
    flex-direction: row;
    text-align-vertical: center;
    height: 30px;
    padding: 2px 8px;
    margin-right: 10px;
`

const AddSpacesText = styled.Text`
    color: ${(props) => props.theme.colors.prime1};
    font-size: 12px;
    display: flex;
    align-items: flex-end;
    flex-direction: row;
    justify-content: center;
`

const SpacesCounterPill = styled.View`
    padding: 1px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background: ${(props) => props.theme.colors.prime1};
    border-radius: 50px;
    margin-right: 5px;
`

const SpacesCounterText = styled.Text`
    color: white;
    font-weight: 600;
    text-align: center;
    font-size: 12px;
`
