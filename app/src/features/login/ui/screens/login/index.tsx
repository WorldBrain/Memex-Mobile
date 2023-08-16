import React from 'react'
import { TextInput, Dimensions } from 'react-native'
import styled from 'styled-components/native'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import * as icons from 'src/ui/components/icons/icons-list'
import styles from '../../components/login.styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import { PrimaryAction } from 'src/ui/utils/ActionButtons'
import { SectionCircle } from 'src/ui/utils/SectionCircle'
import { theme } from 'src/ui/components/theme/theme'

const MemexLogoFile = require('src/ui/assets/MemexIcon.png')

export default class LoginScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    private aspectRatio: number

    constructor(props: Props) {
        super(props, new Logic(props))

        const { height, width } = Dimensions.get('window')
        this.aspectRatio = height / width
    }

    private onLoginPress = () => this.processEvent('submitLogin', null)
    private onModeToggle = () => this.processEvent('toggleMode', null)

    render() {
        return (
            <LoginSignupContainer>
                <LoginSignupScreen>
                    {this.state.mode === 'signup' && (
                        <>
                            <MemexLogo
                                resizeMode="contain"
                                source={MemexLogoFile}
                            />
                            <IntroTitle>Create a new account</IntroTitle>
                        </>
                    )}
                    {this.state.mode === 'login' && (
                        <>
                            <MemexLogo
                                resizeMode="contain"
                                source={MemexLogoFile}
                            />
                            <IntroTitle>Login to Memex</IntroTitle>
                        </>
                    )}
                    {this.state.mode === 'requestReset' && (
                        <>
                            {SectionCircle(60, icons.Reload)}
                            <IntroTitle>Request a new password</IntroTitle>
                        </>
                    )}
                    {this.state.mode === 'confirmReset' && (
                        <>
                            {SectionCircle(60, icons.Mail)}
                            <IntroTitle>Check your email inbox</IntroTitle>
                        </>
                    )}
                    <LoginSignupBox>
                        {this.state.mode !== 'confirmReset' && (
                            <>
                                <TextInputContainer>
                                    <Icon
                                        icon={icons.Mail}
                                        heightAndWidth={'22px'}
                                        strokeWidth={'0px'}
                                        fill
                                    />
                                    <TextInputBox
                                        value={this.state.emailInputValue}
                                        onChangeText={(value) =>
                                            this.processEvent(
                                                'changeEmailInput',
                                                { value },
                                            )
                                        }
                                        placeholder="Email"
                                        placeholderTextColor={
                                            theme.colors.greyScale5
                                        }
                                        textContentType="emailAddress"
                                        editable={
                                            this.state.loginState !== 'running'
                                        }
                                        autoCapitalize="none"
                                    />
                                </TextInputContainer>
                            </>
                        )}

                        {(this.state.mode === 'login' ||
                            this.state.mode === 'signup') && (
                            <>
                                <TextInputContainer>
                                    <Icon
                                        icon={icons.Lock}
                                        heightAndWidth={'24px'}
                                        strokeWidth={'0px'}
                                        fill
                                    />
                                    <TextInputBox
                                        value={this.state.passwordInputValue}
                                        onChangeText={(value) =>
                                            this.processEvent(
                                                'changePasswordInput',
                                                { value },
                                            )
                                        }
                                        placeholder="Password"
                                        textContentType="password"
                                        secureTextEntry
                                        editable={
                                            this.state.loginState !== 'running'
                                        }
                                        placeholderTextColor={
                                            theme.colors.greyScale5
                                        }
                                        autoCapitalize="none"
                                    />
                                </TextInputContainer>
                                {this.state.mode !== 'signup' && (
                                    <ForgotPasswordBox
                                        onPress={() =>
                                            this.processEvent(
                                                'requestPasswordReset',
                                                null,
                                            )
                                        }
                                    >
                                        <ForgotPasswordText>
                                            Forgot Password?
                                        </ForgotPasswordText>
                                    </ForgotPasswordBox>
                                )}
                                {this.state.mode === 'signup' &&
                                    this.state.passwordInputValue.length >
                                        0 && (
                                        <TextInputContainer>
                                            <Icon
                                                icon={icons.Lock}
                                                heightAndWidth={'24px'}
                                                fill
                                                strokeWidth="0px"
                                            />
                                            <TextInputBox
                                                value={
                                                    this.state
                                                        .passwordConfirmInputValue
                                                }
                                                onChangeText={(value) =>
                                                    this.processEvent(
                                                        'changePasswordConfirmInput',
                                                        { value },
                                                    )
                                                }
                                                placeholder="Confirm your Password"
                                                textContentType="password"
                                                secureTextEntry
                                                editable={
                                                    this.state.loginState !==
                                                    'running'
                                                }
                                                placeholderTextColor={
                                                    theme.colors.greyScale5
                                                }
                                                autoCapitalize="none"
                                            />
                                        </TextInputContainer>
                                    )}
                            </>
                        )}
                        <ActionButtonContainer>
                            {this.state.mode === 'login' && (
                                <>
                                    <PrimaryAction
                                        label={'Log in'}
                                        onPress={this.onLoginPress}
                                        isDisabled={
                                            this.state.emailInputValue
                                                .length === 0 &&
                                            this.state.passwordInputValue
                                                .length === 0
                                        }
                                        type="primary"
                                        size="medium"
                                    />
                                    {/* <PrimaryAction
                                    label={'New to Memex?'}
                                    onPress={this.props.onModeToggle}
                                    type="forth"
                                    size="medium"
                                /> */}
                                </>
                            )}
                            {this.state.mode === 'signup' && (
                                <>
                                    <PrimaryAction
                                        label={'Sign up'}
                                        onPress={this.onLoginPress}
                                        isDisabled={
                                            this.state.emailInputValue
                                                .length === 0 &&
                                            this.state.passwordInputValue
                                                .length === 0 &&
                                            this.state
                                                .passwordConfirmInputValue !=
                                                this.state.passwordInputValue
                                        }
                                        type="primary"
                                        size="medium"
                                    />
                                    <PrimaryAction
                                        label={'Already have an Account?'}
                                        onPress={this.onModeToggle}
                                        type="forth"
                                        size="medium"
                                    />
                                </>
                            )}
                            {this.state.mode === 'requestReset' && (
                                <>
                                    <PrimaryAction
                                        label={'Request Reset'}
                                        onPress={() =>
                                            this.processEvent(
                                                'confirmPasswordReset',
                                                {
                                                    email: this.state
                                                        .emailInputValue,
                                                },
                                            )
                                        }
                                        isDisabled={
                                            this.state.emailInputValue
                                                .length === 0
                                        }
                                        type="primary"
                                        size="medium"
                                    />
                                    <PrimaryAction
                                        label={'Go Back'}
                                        onPress={this.onModeToggle}
                                        type="forth"
                                        size="medium"
                                    />
                                </>
                            )}
                            {this.state.mode === 'confirmReset' && (
                                <>
                                    <PrimaryAction
                                        label={'Back to login'}
                                        onPress={this.onModeToggle}
                                        type="forth"
                                        size="medium"
                                    />
                                </>
                            )}
                        </ActionButtonContainer>
                        {this.state.loginState === 'running' && (
                            <LoadingBox>
                                <LoadingBalls />
                            </LoadingBox>
                        )}
                        {this.state.loginState === 'error' && (
                            <WarningBox>
                                <WarningText
                                    style={
                                        this.aspectRatio > 1.6
                                            ? styles.errorTitle
                                            : {
                                                  fontSize: 14,
                                                  paddingHorizontal: 30,
                                                  textAlign: 'center',
                                              }
                                    }
                                >
                                    Your email or password was incorrect -
                                    please try again
                                </WarningText>
                            </WarningBox>
                        )}

                        {/* {
                            this.props.mode === 'login' && (
                                <Button
                                    title="Forgot?"
                                    style={
                                        aspectRatio > 1.6
                                            ? styles.forgotPasswordButton
                                            : styles.ipadForgotPasswordButton
                                    }
                                    onPress={this.props.onPasswordForgot}
                                    empty
                                />
                            )
                        } */}
                        {/* <View
                            style={
                                aspectRatio > 1.6
                                    ? styles.extraContainer
                                    : {
                                        display: 'flex',
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                    }
                            }
                        >
                            {this.props.isLoading && <LoadingBalls />}
                            {this.props.hasError && (
                                <Text
                                    style={
                                        aspectRatio > 1.6
                                            ? styles.errorTitle
                                            : {
                                                fontSize: 14,
                                                paddingHorizontal: 30,
                                                textAlign: 'center',
                                            }
                                    }
                                >
                                    Your email or password was incorrect - please try
                                    again
                                </Text>
                            )}
                        </View> */}
                    </LoginSignupBox>
                </LoginSignupScreen>
            </LoginSignupContainer>
        )
    }
}

const WarningBox = styled.View`
    padding: 20px;
    background: ${(props) => props.theme.colors.warning};
    margin-top: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
`

const WarningText = styled.Text`
    color: white;
    font-size: 16px;
    text-align: center;
    font-family: 'Satoshi';
`

const ActionButtonContainer = styled.View`
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const IntroTitle = styled.Text`
    font-size: 24px;
    color: ${(props) => props.theme.colors.white};
    margin-bottom: 20px;
    font-weight: 900;
    margin-top: 20px;
    font-family: 'Satoshi';
`

const MemexLogo = styled.Image`
    height: 60px;
    display: flex;
`

const LoginSignupScreen = styled.SafeAreaView`
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    margin-top: 200px;
`

const LoginSignupContainer = styled.View`
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${(props) => props.theme.colors.black};
`

const LoginSignupBox = styled.View`
    display: flex;
    justify-content: center;
    width: 100%;
    align-items: center;
    padding: 20px 0px;
`

const TextInputContainer = styled.View`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    height: 50px;
    border-radius: 8px;
    width: 350px;
    padding: 0 15px;
    margin-bottom: 15px;
    border-width: 1px;
    border-radius: 8px;
    border-color: ${(props) => props.theme.colors.greyScale2};
    background: ${(props) => props.theme.colors.greyScale2};

    &:focus-within {
        border-color: ${(props) => props.theme.colors.greyScale3};
    }
`

const TextInputBox = styled(TextInput)`
    background: transparent;
    flex: 1;
    color: ${(props) => props.theme.colors.greyScale6};
    border-style: solid;
    padding-left: 10px;
    height: 100%;
`

const ForgotPasswordBox = styled.TouchableOpacity`
    width: 350px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding-right: 10px;
    margin-top: -5px;
`

const ForgotPasswordText = styled.Text`
    color: ${(props) => props.theme.colors.prime1};
    font-size: 14px;
    font-family: 'Satoshi';
`

const LoadingBox = styled.View`
    margin-top: 20px;
`
