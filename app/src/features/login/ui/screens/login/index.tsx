import React from 'react'

import { NavigationScreen } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import Login from '../../components/login'

export default class LoginScreen extends NavigationScreen<Props, State, Event> {
    constructor(props: Props) {
        super(props, { logic: new Logic(props) })
    }

    render() {
        return (
            <Login
                hasError={this.state.loginState === 'error'}
                emailInputValue={this.state.emailInputValue}
                passwordInputValue={this.state.passwordInputValue}
                onLoginPress={() => this.processEvent('submitLogin', null)}
                onCancelPress={() => this.processEvent('cancelLogin', null)}
                onEmailChange={value =>
                    this.processEvent('changeEmailInput', { value })
                }
                onPasswordChange={value =>
                    this.processEvent('changePasswordInput', { value })
                }
            />
        )
    }
}
