import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'

import { storageKeys } from '../../../../../../app.json'
import { UITaskState, UIServices, MainNavProps } from 'src/ui/types'
import { executeUITask } from 'src/ui/utils'
import type { LoginMode } from '../../types'

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface State {
    loginState: UITaskState
    emailInputValue: string
    passwordInputValue: string
    mode: LoginMode
}

export type Event = UIEvent<{
    changeEmailInput: { value: string }
    changePasswordInput: { value: string }
    submitLogin: null
    cancelLogin: null
    toggleMode: null
}>

export interface Props extends MainNavProps<'Login'> {
    services: UIServices<'auth' | 'localStorage'>
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            mode: 'login',
            emailInputValue: '',
            passwordInputValue: '',
            loginState: 'pristine',
        }
    }

    toggleMode: EventHandler<'toggleMode'> = ({ previousState }) => {
        const nextMode = previousState.mode === 'login' ? 'signup' : 'login'
        this.emitMutation({ mode: { $set: nextMode } })
    }

    changeEmailInput: EventHandler<'changeEmailInput'> = ({ event }) => {
        this.emitMutation({ emailInputValue: { $set: event.value } })
    }

    changePasswordInput: EventHandler<'changePasswordInput'> = ({ event }) => {
        this.emitMutation({ passwordInputValue: { $set: event.value } })
    }

    cancelLogin: EventHandler<'cancelLogin'> = async () => {
        const { localStorage } = this.props.services

        await localStorage.set(storageKeys.skipAutoSync, true)
        this.props.navigation.goBack()
    }

    submitLogin: EventHandler<'submitLogin'> = async ({
        previousState: { emailInputValue: email, passwordInputValue: password },
    }) => {
        const { services, navigation, route } = this.props

        await executeUITask<State, 'loginState', void>(
            this,
            'loginState',
            async () => {
                await services.auth.loginWithEmailAndPassword(email, password)

                if (route.params.nextRoute) {
                    navigation.navigate(route.params.nextRoute)
                } else {
                    navigation.goBack()
                }
            },
        )
    }
}
