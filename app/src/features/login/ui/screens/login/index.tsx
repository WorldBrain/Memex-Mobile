import React from 'react'

import { StatefulUIElement } from 'src/ui/types'
import Logic, { Props, State, Event } from './logic'
import Login from '../../components/login'

export default class LoginScreen extends StatefulUIElement<
    Props,
    State,
    Event
> {
    constructor(props: Props) {
        super(props, new Logic(props))
    }

    render() {
        return (
            <Login
                mode={this.state.mode}
                hasError={this.state.loginState === 'error'}
                isLoading={this.state.loginState === 'running'}
                emailInputValue={this.state.emailInputValue}
                passwordInputValue={this.state.passwordInputValue}
                onModeToggle={() => this.processEvent('toggleMode', null)}
                onLoginPress={() => this.processEvent('submitLogin', null)}
                onEmailChange={(value) =>
                    this.processEvent('changeEmailInput', { value })
                }
                onPasswordChange={(value) =>
                    this.processEvent('changePasswordInput', { value })
                }
                onPasswordForgot={() =>
                    console.log('you forgot your password...')
                }
            />
        )
    }
}
