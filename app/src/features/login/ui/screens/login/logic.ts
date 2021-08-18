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
    changePasswordInput: { value: string }
    changeEmailInput: { value: string }
    submitLogin: null
    toggleMode: null
}>

export interface Props extends MainNavProps<'Login'> {
    services: UIServices<'auth'>
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

    submitLogin: EventHandler<'submitLogin'> = async ({
        previousState: {
            mode,
            emailInputValue: email,
            passwordInputValue: password,
        },
    }) => {
        const {
            services: { auth },
            navigation,
            route,
        } = this.props

        await executeUITask<State, 'loginState', void>(
            this,
            'loginState',
            async () => {
                if (mode === 'login') {
                    await auth.loginWithEmailAndPassword(email, password)
                } else {
                    await auth.signupWithEmailAndPassword(email, password)
                }

                if (route.params?.nextRoute) {
                    // This timeout needs to be here for android, which doesn't update the routes
                    //  in time for this nav event
                    await new Promise((resolve) => setTimeout(resolve, 0))
                    const nextRoute = route.params.nextRoute
                    navigation.navigate(nextRoute)
                } else {
                    navigation.goBack()
                }
            },
        )
    }
}
