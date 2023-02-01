import React from 'react'
import styled from 'styled-components/native'
import { People as SharedIcon } from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'

export interface Props {
    name?: string
    isShared?: boolean
}

const SpacePill: React.SFC<Props> = ({ name, isShared }) => (
    <SpacePillContainer>
        {isShared && (
            <>
                <Icon
                    icon={SharedIcon}
                    color={'greyScale5'}
                    fill={true}
                    strokeWidth="1px"
                    heightAndWidth="12px"
                />
                <Spacer />
            </>
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
    padding: 4px 8px;
    background: ${(props) => props.theme.colors.greyScale2};
    align-items: center;
    display: flex;
    text-align: center;
    margin-right: 3px;
    border-radius: 5px;
    margin-bottom: 5px;
`

const Spacer = styled.View`
    width: 2px;
`

const SpacePillText = styled.Text<{ isShared: boolean }>`
    color: ${(props) => props.theme.colors.greyScale6};
    display: flex;
    text-align: center;
    font-size: 12px;
    letter-spacing: 0.3px;
`
