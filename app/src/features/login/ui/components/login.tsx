import React from 'react'
import { Text, View, TextInput } from 'react-native'

import { TouchEventHandler } from 'src/ui/types'
import Button from 'src/ui/components/memex-btn'
import styles from './login.styles'

export interface Props {
    hasError?: boolean
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
                textContentType="emailAddress"
            />
            <TextInput
                style={styles.textInput}
                value={props.passwordInputValue}
                onChangeText={props.onPasswordChange}
                placeholder="Password"
                textContentType="password"
                secureTextEntry
            />
        </View>
        <View style={styles.actionBtnsContainer}>
            <Button title="Login" onPress={props.onLoginPress} />
            <Button title="Cancel" onPress={props.onCancelPress} empty />
        </View>
        {props.hasError && (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>
                    Your email or password was incorrect - please try again
                </Text>
            </View>
        )}
    </View>
)

export default Login
