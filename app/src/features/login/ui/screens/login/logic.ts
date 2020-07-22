import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'

import { UITaskState, UIServices, NavigationProps } from 'src/ui/types'

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
    services: UIServices<'auth'>
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

    cancelLogin: EventHandler<'cancelLogin'> = ({ previousState }) => {
        console.log('cancel!')
    }

    submitLogin: EventHandler<'submitLogin'> = ({ previousState }) => {
        console.log('logging in...')
        console.log('email:', previousState.emailInputValue)
        console.log('pw:', previousState.passwordInputValue)
    }
}
