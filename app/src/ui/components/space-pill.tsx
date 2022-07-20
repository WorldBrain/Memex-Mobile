import React from 'react'
import styled from 'styled-components/native'
import { Shared as SharedIcon } from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'

export interface Props {
    name?: string
    isShared?: boolean
}

const SpacePill: React.SFC<Props> = ({ name, isShared }) => (
    <SpacePillContainer>
        {isShared && (
            <Icon
                icon={SharedIcon}
                color={'white'}
                fill={true}
                strokeWidth="2px"
                heightAndWidth="12px"
            />
        )}
        <SpacePillText>
            {(isShared ? ' ' : '') + (name ?? 'Missing Space')}
        </SpacePillText>
    </SpacePillContainer>
)

export default React.memo(SpacePill)

const SpacePillContainer = styled.View`
    display: flex;
    flex-direction: row;
    padding: 3px 8px;
    background: ${(props) => props.theme.colors.purple};
    align-items: center;
    display: flex;
    text-align-vertical: center;
    margin-right: 3px;
    border-radius: 3px;
    margin-bottom: 5px;
`

const SpacePillText = styled.Text`
    color: white;
    display: flex;
    text-align-vertical: center;
    font-size: 12px;
    margin-left: 5px;
`
