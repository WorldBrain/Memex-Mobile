import React from 'react'
import { Text, View, TextInput } from 'react-native'

import { TouchEventHandler } from 'src/ui/types'
import Button from 'src/ui/components/memex-btn'
import styles from './login.styles'
import LoadingBalls from 'src/ui/components/loading-balls'

export interface Props {
    hasError?: boolean
    isLoading?: boolean
    emailInputValue: string
    passwordInputValue: string
    onLoginPress: TouchEventHandler
    onCancelPress: TouchEventHandler
    onEmailChange: (text: string) => void
    onPasswordChange: (text: string) => void
}

const Login: React.StatelessComponent<Props> = props => (
    <View style={styles.container}>
        <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Login to Sync</Text>
            <Text style={styles.infoSubtext}>
                Your changes are saved, but not synced
            </Text>
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
        </View>
        <View style={styles.actionBtnsContainer}>
            <Button
                style={styles.loginButton}
                title="Login"
                onPress={props.onLoginPress}
            />
            <Button
                style={styles.cancelButton}
                title="Cancel"
                onPress={props.onCancelPress}
                empty
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

export default Login
