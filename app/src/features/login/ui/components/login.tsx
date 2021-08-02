import React from 'react'
import { Text, View, TextInput } from 'react-native'

import { TouchEventHandler } from 'src/ui/types'
import Button from 'src/ui/components/memex-btn'
import styles from './login.styles'
import LoadingBalls from 'src/ui/components/loading-balls'
import type { LoginMode } from '../types'

export interface Props {
    mode: LoginMode
    hasError?: boolean
    isLoading?: boolean
    showCancelBtn?: boolean
    emailInputValue: string
    passwordInputValue: string
    onLoginPress: TouchEventHandler
    onCancelPress: TouchEventHandler
    onModeToggle: () => void
    onPasswordForgot: () => void
    onEmailChange: (text: string) => void
    onPasswordChange: (text: string) => void
}

const Login: React.StatelessComponent<Props> = (props) => (
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
            {props.showCancelBtn && (
                <Button
                    title="Cancel"
                    style={styles.cancelButton}
                    onPress={props.onCancelPress}
                    empty
                />
            )}
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

export default Login
