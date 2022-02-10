import React from 'react'
import {
    Text,
    View,
    TextInput,
    Platform,
    Dimensions,
    GestureResponderEvent,
} from 'react-native'

import { TouchEventHandler } from 'src/ui/types'
import Button from 'src/ui/components/memex-btn'
import styles from './login.styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import type { LoginMode } from '../types'
import { useDeviceOrientation } from '@react-native-community/hooks'
import * as icons from 'src/ui/components/icons/icons-list'
import { Icon } from 'src/ui/components/icons/icon-mobile'
import styled from 'styled-components/native'
import { SafeAreaView } from 'react-native'
import { theme } from 'src/ui/components/theme/theme'
import { PrimaryAction, SecondaryAction } from 'src/ui/utils/ActionButtons'
import { WorldbrainAuthService } from '@worldbrain/memex-common/lib/authentication/worldbrain'

const MemexLogoFile = require('src/ui/assets/MemexIcon.png')

export interface Props {
    mode: LoginMode
    hasError?: boolean
    isLoading?: boolean
    emailInputValue: string
    passwordInputValue: string
    passwordConfirmInputValue: string
    onLoginPress: TouchEventHandler
    onModeToggle: () => void
    onPasswordForgot: () => void
    onEmailChange: (text: string) => void
    onPasswordChange: (text: string) => void
    onPasswordConfirmChange: (text: string) => void
    requestPasswordReset: () => void
    confirmPasswordReset: () => void
}

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

const Login: React.StatelessComponent<Props> = (props) => {
    const orientation = useDeviceOrientation()

    console.log(props.mode)

    return (
        <LoginSignupContainer>
            <LoginSignupScreen>
                {props.mode === 'signup' && (
                    <>
                        <MemexLogo
                            resizeMode="contain"
                            source={MemexLogoFile}
                        />
                        <IntroTitle>Create a new account</IntroTitle>
                    </>
                )}
                {props.mode === 'login' && (
                    <>
                        <SectionCircle>
                            <Icon
                                icon={icons.Login}
                                heightAndWidth={'30px'}
                                color="purple"
                            />
                        </SectionCircle>
                        <IntroTitle>Login to Memex</IntroTitle>
                    </>
                )}
                {props.mode === 'requestReset' && (
                    <>
                        <SectionCircle>
                            <Icon
                                icon={icons.Login}
                                heightAndWidth={'30px'}
                                color="purple"
                            />
                        </SectionCircle>
                        <IntroTitle>Request a new password</IntroTitle>
                    </>
                )}
                {props.mode === 'confirmReset' && (
                    <>
                        <SectionCircle>
                            <Icon
                                icon={icons.Login}
                                heightAndWidth={'30px'}
                                color="purple"
                            />
                        </SectionCircle>
                        <IntroTitle>Check your email inbox</IntroTitle>
                    </>
                )}
                <LoginSignupBox containerViewStyle={{ width: '100%' }}>
                    {props.mode !== 'confirmReset' && (
                        <>
                            <TextInputContainer>
                                <Icon
                                    icon={icons.Mail}
                                    heightAndWidth={'20px'}
                                />
                                <TextInputBox
                                    value={props.emailInputValue}
                                    onChangeText={props.onEmailChange}
                                    placeholder="Email"
                                    placeholderTextColor={
                                        theme.colors.lighterText
                                    }
                                    textContentType="emailAddress"
                                    editable={!props.isLoading}
                                    autoCapitalize="none"
                                />
                            </TextInputContainer>
                        </>
                    )}

                    {(props.mode === 'login' || props.mode === 'signup') && (
                        <>
                            <TextInputContainer>
                                <Icon
                                    icon={icons.Lock}
                                    heightAndWidth={'20px'}
                                />
                                <TextInputBox
                                    value={props.passwordInputValue}
                                    onChangeText={props.onPasswordChange}
                                    placeholder="Password"
                                    textContentType="password"
                                    secureTextEntry
                                    editable={!props.isLoading}
                                    placeholderTextColor={
                                        theme.colors.lighterText
                                    }
                                    autoCapitalize="none"
                                />
                            </TextInputContainer>
                            {props.mode !== 'signup' && (
                                <ForgotPasswordBox
                                    onPress={props.requestPasswordReset}
                                    containerViewStyle={{ width: '100%' }}
                                >
                                    <ForgotPasswordText>
                                        Forgot Password?
                                    </ForgotPasswordText>
                                </ForgotPasswordBox>
                            )}
                            {props.mode === 'signup' &&
                                props.passwordInputValue.length > 0 && (
                                    <TextInputContainer>
                                        <Icon
                                            icon={icons.Lock}
                                            heightAndWidth={'20px'}
                                        />
                                        <TextInputBox
                                            value={
                                                props.passwordConfirmInputValue
                                            }
                                            onChangeText={
                                                props.onPasswordConfirmChange
                                            }
                                            placeholder="Confirm your Password"
                                            textContentType="confirmPassword"
                                            secureTextEntry
                                            editable={!props.isLoading}
                                            placeholderTextColor={
                                                theme.colors.lighterText
                                            }
                                            autoCapitalize="none"
                                        />
                                    </TextInputContainer>
                                )}
                        </>
                    )}
                    <ActionButtonContainer>
                        {props.mode === 'login' && (
                            <>
                                <PrimaryAction
                                    label={'Log in'}
                                    onPress={props.onLoginPress}
                                    isDisabled={
                                        props.emailInputValue.length === 0 &&
                                        props.passwordInputValue.length === 0
                                    }
                                />
                                <SecondaryAction
                                    label={'New to Memex?'}
                                    onPress={props.onModeToggle}
                                    width="200px"
                                />
                            </>
                        )}
                        {props.mode === 'signup' && (
                            <>
                                <PrimaryAction
                                    label={'Sign up'}
                                    onPress={props.onLoginPress}
                                    isDisabled={
                                        props.emailInputValue.length === 0 &&
                                        props.passwordInputValue.length === 0 &&
                                        props.passwordConfirmInputValue !=
                                            props.passwordInputValue
                                    }
                                />
                                <SecondaryAction
                                    label={'Already have an Account?'}
                                    onPress={props.onModeToggle}
                                    width="200px"
                                />
                            </>
                        )}
                        {props.mode === 'requestReset' && (
                            <>
                                <PrimaryAction
                                    label={'Request Reset'}
                                    onPress={props.confirmPasswordReset}
                                    isDisabled={
                                        props.emailInputValue.length === 0
                                    }
                                />
                                <SecondaryAction
                                    label={'Go Back'}
                                    onPress={props.onModeToggle}
                                    width="200px"
                                />
                            </>
                        )}
                        {props.mode === 'confirmReset' && (
                            <>
                                <PrimaryAction
                                    label={'Back to login'}
                                    onPress={props.onModeToggle}
                                />
                            </>
                        )}
                    </ActionButtonContainer>
                    {props.isLoading && <LoadingBalls />}
                    {props.hasError && (
                        <WarningBox>
                            <WarningText
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
                                Your email or password was incorrect - please
                                try again
                            </WarningText>
                        </WarningBox>
                    )}

                    {/* {
                            props.mode === 'login' && (
                                <Button
                                    title="Forgot?"
                                    style={
                                        aspectRatio > 1.6
                                            ? styles.forgotPasswordButton
                                            : styles.ipadForgotPasswordButton
                                    }
                                    onPress={props.onPasswordForgot}
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
                            {props.isLoading && <LoadingBalls />}
                            {props.hasError && (
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
`

const ActionButtonContainer = styled.View`
    margin-top: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
`

const IntroTitle = styled.Text`
    font-size: 20px;
    color: ${(props) => props.theme.colors.darkerText};
    margin-bottom: 20px;
    font-weight: 800;
    margin-top: 30px;
`

const SectionCircle = styled.View`
    background: ${(props) => props.theme.colors.backgroundHighlight};
    border-radius: 100px;
    height: 60px;
    width: 60px;
    display: flex;
    justify-content: center;
    align-items: center;
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
    margin-top: 100px;
`

const LoginSignupContainer = styled.View`
    height: 100%;
    width: 100%;
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20%;
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
    border: 1px solid ${(props) => props.theme.colors.lineLightGrey};
    height: 50px;
    border-radius: 8px;
    width: 350px;
    padding: 0 15px;
    margin-bottom: 15px;
`

const TextInputBox = styled(TextInput)`
    background: transparent;
    flex: 1;
    color: ${(props) => props.theme.colors.darkerText};
    background: transparent;
    margin-left: 10px;
`

const ForgotPasswordBox = styled.TouchableOpacity`
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    padding-right: 20px;
    margin-top: -5px;
`

const ForgotPasswordText = styled.Text`
    color: ${(props) => props.theme.colors.purple};
    font-size: 14px;
`

export default Login
