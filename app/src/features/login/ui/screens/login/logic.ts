import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'

import { storageKeys } from '../../../../../../app.json'
import { UITaskState, UIServices, NavigationProps } from 'src/ui/types'
import { executeUITask } from 'src/ui/utils'

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface State {
    loginState: UITaskState
    emailInputValue: string
    passwordInputValue: string
}

export type Event = UIEvent<{
    changeEmailInput: { value: string }
    changePasswordInput: { value: string }
    submitLogin: null
    cancelLogin: null
}>

export interface Props extends NavigationProps {
    previousRoute: 'Overview' | 'ShareModal'
    services: UIServices<'auth' | 'localStorage'>
}

export default class Logic extends UILogic<State, Event> {
    constructor(private props: Props) {
        super()
    }

    getInitialState(): State {
        return {
            emailInputValue: '',
            passwordInputValue: '',
            loginState: 'pristine',
        }
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
        this.navBackToPrevRoute()
    }

    submitLogin: EventHandler<'submitLogin'> = async ({
        previousState: { emailInputValue: email, passwordInputValue: password },
    }) => {
        const { auth } = this.props.services

        await executeUITask<State, 'loginState', void>(
            this,
            'loginState',
            async () => {
                await auth.loginWithEmailAndPassword(email, password)
                this.navBackToPrevRoute()
            },
        )
    }

    private navBackToPrevRoute = () =>
        this.props.navigation.navigate(this.props.previousRoute)
}
