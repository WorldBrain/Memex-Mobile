import { ColorThemeKeys } from '@worldbrain/memex-common/lib/common-ui/styles/types'
import React from 'react'
import { SvgProps } from 'react-native-svg'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled, { css } from 'styled-components/native'
import { Dimensions, ScaledSize } from 'react-native'
import { StatefulUIElement } from 'src/ui/types'
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
    rightArea?: JSX.Element
}

export interface State {
    isLandscape: boolean
}

export default class Navigation extends React.Component<Props> {
    state = {
        isLandscape: false,
    }

    constructor(props: Props) {
        super(props)
    }

    handleOrientationChange = () => {
        this.setState({
            isLandscape:
                Dimensions.get('screen').width > Dimensions.get('screen').height
                    ? true
                    : false,
        })
    }

    componentDidMount() {
        this.setState({
            isLandscape:
                Dimensions.get('screen').width > Dimensions.get('screen').height
                    ? true
                    : false,
        })
        Dimensions.addEventListener('change', this.handleOrientationChange)
    }

    render() {
        return (
            <Container isLandscape={this.state.isLandscape}>
                <ContainerBox isLandscape={this.state.isLandscape}>
                    {this.props.leftIcon && (
                        <LeftBtnContainer>
                            <IconBox onPress={this.props.leftBtnPress}>
                                <Icon
                                    heightAndWidth={this.props.leftIconSize}
                                    strokeWidth={this.props.leftIconStrokeWidth}
                                    icon={this.props.leftIcon}
                                    fill
                                />
                            </IconBox>
                        </LeftBtnContainer>
                    )}
                    {typeof this.props.titleText === 'string' ? (
                        <TextArea numberOfLines={1}>
                            {this.props.titleText}
                        </TextArea>
                    ) : (
                        <>{this.props.titleText}</>
                    )}
                    <RightBtnContainer onPress={this.props.rightBtnPress}>
                        {this.props.rightIcon && (
                            <Icon
                                heightAndWidth={this.props.rightIconSize}
                                color={this.props.rightIconColor}
                                strokeWidth={
                                    this.props.rightIconStrokeWidth ?? '1.5'
                                }
                                icon={this.props.rightIcon}
                                fill
                            />
                        )}
                        {this.props.rightArea && this.props.rightArea}
                    </RightBtnContainer>
                </ContainerBox>
            </Container>
        )
    }
}

export const height = 100

const Container = styled.View<{
    isLandscape?: boolean
}>`
    width: 100%;
    display: flex;
    justify-content: flex-end;
    flex-direction: row;
    align-items: center;
    height: ${height}px;
    border-bottom-color: ${(props) => props.theme.colors.greyScale1};
    background: ${(props) => props.theme.colors.black};
    border-bottom-width: 1px;
    margin-top: -55px;

    ${(props) =>
        props.isLandscape &&
        css`
            width: ${(props) => Dimensions.get('window').width}px;
        `};
`

const ContainerBox = styled.View<{
    isLandscape?: boolean
}>`
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
    width: 100%;
    padding: 0 15px 0px;
    margin-bottom: -50px;

    ${(props) =>
        props.isLandscape &&
        css`
            padding: 5px 50px 0px 50px;
        `};
`

const Spacer10 = styled.View`
    width: 20px;
`

const LeftBtnContainer = styled.View`
    height: 30px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex: 1;
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
    display: flex;
    flex: 1;
    justify-content: flex-end;
    align-items: center;
    flex-direction: row;
`

const TextArea = styled.Text`
    font-size: 16px;
    height: 100%;
    align-items: center;
    display: flex;
    font-weight: 600;
    color: ${(props) => props.theme.colors.white};
    font-family: 'Satoshi';
`
