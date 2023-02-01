import { ColorThemeKeys } from '@worldbrain/memex-common/lib/common-ui/styles/types'
import React from 'react'
import { SvgProps } from 'react-native-svg'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'

export interface Props {
    titleText?: React.ReactNode
    renderLeftIcon?: () => JSX.Element
    renderRightIcon?: () => JSX.Element | undefined
    leftBtnPress?: () => void
    leftIcon?: React.FC<SvgProps>
    leftIconSize?: string
    leftIconStrokeWidth?: string
    renderIndicator?: () => JSX.Element
    rightBtnPress?: () => Promise<void> | void
    rightIcon?: React.FC<SvgProps> | undefined
    rightIconColor?: ColorThemeKeys
    rightIconSize?: string
    rightIconStrokeWidth?: string
}

const Navigation: React.StatelessComponent<Props> = (props) => (
    <Container>
        <ContainerBox>
            <LeftBtnContainer>
                {props.leftIcon && (
                    <IconBox onPress={props.leftBtnPress}>
                        <Icon
                            heightAndWidth={props.leftIconSize}
                            strokeWidth={props.leftIconStrokeWidth}
                            icon={props.leftIcon}
                        />
                    </IconBox>
                )}
                <Spacer10 />
                {props.renderIndicator?.()}
            </LeftBtnContainer>
            {typeof props.titleText === 'string' ? (
                <TextArea numberOfLines={1}>{props.titleText}</TextArea>
            ) : (
                <>{props.titleText}</>
            )}
            <RightBtnContainer onPress={props.rightBtnPress}>
                {props.rightIcon && (
                    <Icon
                        heightAndWidth={props.rightIconSize}
                        color={props.rightIconColor}
                        strokeWidth={props.rightIconStrokeWidth}
                        icon={props.rightIcon}
                    />
                )}
            </RightBtnContainer>
        </ContainerBox>
    </Container>
)

export const height = 100

const Container = styled.View`
    width: 100%;
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: center;
    height: ${height}px;
    border-bottom-color: ${(props) => props.theme.colors.greyScale5};
    border-bottom-width: 1px;
    background: ${(props) => props.theme.colors.white};
    margin-top: -50px;
`

const ContainerBox = styled.View`
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    width: 100%;
    padding: 0 24px 10px;
    margin-bottom: -50px;
`

const Spacer10 = styled.View`
    width: 20px;
`

const LeftBtnContainer = styled.View`
    height: 30px;
    width: 50px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
`

const IconBox = styled.TouchableOpacity`
    height: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const RightBtnContainer = styled.TouchableOpacity`
    height: 30px;
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
`

const TextArea = styled.Text`
    font-size: 16px;
    height: 100%;
    align-items: center;
    display: flex;
    font-weight: 800;
    color: ${(props) => props.theme.colors.greyScale5};
`

export default Navigation
