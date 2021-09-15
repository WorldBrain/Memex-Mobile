import React from 'react'
import { Text, View, TextInput, Platform, Dimensions } from 'react-native'

import { TouchEventHandler } from 'src/ui/types'
import Button from 'src/ui/components/memex-btn'
import styles from './login.styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import type { LoginMode } from '../types'
import { useDeviceOrientation } from '@react-native-community/hooks'
export interface Props {
    mode: LoginMode
    hasError?: boolean
    isLoading?: boolean
    emailInputValue: string
    passwordInputValue: string
    onLoginPress: TouchEventHandler
    onModeToggle: () => void
    onPasswordForgot: () => void
    onEmailChange: (text: string) => void
    onPasswordChange: (text: string) => void
}

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

const Login: React.StatelessComponent<Props> = (props) => {
    const orientation = useDeviceOrientation()

    return Platform.OS === 'ios' ? (
        // Code for Ios

        <View style={styles.container}>
            <View
                style={
                    aspectRatio > 1.6
                        ? null
                        : {
                              height: '100%',
                              width:
                                  orientation.portrait == true ? '45%' : '35%',
                              justifyContent: 'center',
                          }
                }
            >
                <View
                    style={
                        aspectRatio > 1.6
                            ? styles.infoContainer
                            : {
                                  height:
                                      orientation.portrait == true
                                          ? '10%'
                                          : '12%',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginBottom:
                                      orientation.portrait == true ? 6 : 10,
                              }
                    }
                >
                    <Text
                        style={
                            aspectRatio > 1.6
                                ? styles.infoTitle
                                : {
                                      fontWeight: 'bold',
                                      fontSize: 30,
                                  }
                        }
                    >
                        {props.mode === 'login' ? 'Login' : 'Sign Up'}
                    </Text>
                    {/* <Text style={styles.infoSubtext}>
                Your changes are saved, but not synced
            </Text> */}
                </View>
                <View
                    style={{
                        height: orientation.portrait == true ? '20%' : '30%',
                    }}
                >
                    <TextInput
                        style={
                            aspectRatio > 1.6
                                ? styles.textInput
                                : {
                                      margin: 10,
                                      padding: 10,
                                      height: 50,
                                      minWidth: '50%',
                                      backgroundColor: '#f0f0f0',
                                      borderRadius: 5,
                                  }
                        }
                        value={props.emailInputValue}
                        onChangeText={props.onEmailChange}
                        placeholder="Email"
                        placeholderTextColor="#333"
                        textContentType="emailAddress"
                        editable={!props.isLoading}
                        autoCapitalize="none"
                    />
                    <TextInput
                        style={
                            aspectRatio > 1.6
                                ? styles.textInput
                                : {
                                      margin: 10,
                                      padding: 10,
                                      height: 50,
                                      minWidth: '50%',
                                      backgroundColor: '#f0f0f0',
                                      borderRadius: 5,
                                  }
                        }
                        value={props.passwordInputValue}
                        onChangeText={props.onPasswordChange}
                        placeholder="Password"
                        textContentType="password"
                        secureTextEntry
                        editable={!props.isLoading}
                        placeholderTextColor="#333"
                        autoCapitalize="none"
                    />
                    {props.mode === 'login' && (
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
                    )}
                </View>
                <View
                    style={
                        aspectRatio > 1.6
                            ? styles.actionBtnsContainer
                            : {
                                  flex: 0.4,
                                  flexDirection: 'column',
                                  justifyContent: 'flex-end',
                                  alignItems: 'center',
                                  marginVertical: 25,
                              }
                    }
                >
                    <Button
                        title={
                            props.mode === 'login'
                                ? 'No account yet?'
                                : 'Already signed up?'
                        }
                        style={
                            aspectRatio > 1.6
                                ? styles.modeButton
                                : {
                                      // height: 30,
                                      // marginTop: 300,
                                  }
                        }
                        onPress={props.onModeToggle}
                        empty
                    />
                    <Button
                        title={props.mode === 'login' ? 'Login' : 'Sign Up'}
                        style={
                            aspectRatio > 1.6
                                ? styles.loginButton
                                : {
                                      // width: 150,
                                      borderRadius: 60,
                                  }
                        }
                        onPress={props.onLoginPress}
                    />
                </View>
                <View
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
                </View>
            </View>
        </View>
    ) : (
        // Code for Android

        <View style={styles.container}>
            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>
                    {props.mode === 'login' ? 'Login' : 'Sign Up'}
                </Text>
                {/* <Text style={styles.infoSubtext}>
                Your changes are saved, but not synced
            </Text> */}
            </View>
            <View style={styles.inputsContainer}>
                <TextInput
                    style={styles.textInput}
                    value={props.emailInputValue}
                    onChangeText={props.onEmailChange}
                    placeholder="Email"
                    placeholderTextColor="#333"
                    textContentType="emailAddress"
                    editable={!props.isLoading}
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.textInput}
                    value={props.passwordInputValue}
                    onChangeText={props.onPasswordChange}
                    placeholder="Password"
                    textContentType="password"
                    secureTextEntry
                    editable={!props.isLoading}
                    placeholderTextColor="#333"
                    autoCapitalize="none"
                />
                {props.mode === 'login' && (
                    <Button
                        title="Forgot your password?"
                        style={styles.forgotPasswordButton}
                        onPress={props.onPasswordForgot}
                        empty
                    />
                )}
            </View>
            <View style={styles.actionBtnsContainer}>
                <Button
                    title={
                        props.mode === 'login'
                            ? 'No account yet?'
                            : 'Already signed up?'
                    }
                    style={styles.modeButton}
                    onPress={props.onModeToggle}
                    empty
                />
                <Button
                    title={props.mode === 'login' ? 'Login' : 'Sign Up'}
                    style={styles.loginButton}
                    onPress={props.onLoginPress}
                />
            </View>
            <View style={styles.extraContainer}>
                {props.isLoading && <LoadingBalls />}
                {props.hasError && (
                    <Text style={styles.errorTitle}>
                        Your email or password was incorrect - please try again
                    </Text>
                )}
            </View>
        </View>
    )
}

export default Login
