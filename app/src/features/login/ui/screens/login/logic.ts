import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'

import { storageKeys } from '../../../../../../app.json'
import { UITaskState, UIServices, MainNavProps } from 'src/ui/types'
import { executeUITask } from 'src/ui/utils'
import type { LoginMode } from '../../types'
import type { AuthenticatedUser } from '@worldbrain/memex-common/lib/authentication/types'

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface State {
    loginState: UITaskState
    emailInputValue: string
    passwordInputValue: string
    passwordConfirmInputValue: string
    mode: LoginMode
    passwordForgotScreen: boolean
}

export type Event = UIEvent<{
    changePasswordInput: { value: string }
    changePasswordConfirmInput: { value: string }
    changeEmailInput: { value: string }
    submitLogin: null
    toggleMode: null
    confirmPasswordReset: { email: string }
    requestPasswordReset: null
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
            passwordConfirmInputValue: '',
            passwordForgotScreen: false,
        }
    }

    toggleMode: EventHandler<'toggleMode'> = ({ previousState }) => {
        if (previousState.mode === 'confirmReset') {
            this.emitMutation({ mode: { $set: 'login' } })
        } else {
            const nextMode = previousState.mode === 'login' ? 'signup' : 'login'
            this.emitMutation({ mode: { $set: nextMode } })
        }
    }

    changeEmailInput: EventHandler<'changeEmailInput'> = ({ event }) => {
        this.emitMutation({
            emailInputValue: { $set: event.value },
            loginState: { $set: 'pristine' },
        })
    }

    changePasswordInput: EventHandler<'changePasswordInput'> = ({ event }) => {
        this.emitMutation({
            passwordInputValue: { $set: event.value },
            loginState: { $set: 'pristine' },
        })
    }

    requestPasswordReset: EventHandler<'requestPasswordReset'> = () => {
        this.emitMutation({ mode: { $set: 'requestReset' } })
    }

    confirmPasswordReset: EventHandler<'confirmPasswordReset'> = async ({
        event,
    }) => {
        const {
            services: { auth },
        } = this.props

        this.emitMutation({ mode: { $set: 'confirmReset' } })

        await auth.resetPassword(event.email)
    }

    changePasswordConfirmInput: EventHandler<'changePasswordConfirmInput'> = ({
        event,
    }) => {
        this.emitMutation({ passwordConfirmInputValue: { $set: event.value } })
    }

    submitLogin: EventHandler<'submitLogin'> = async ({ previousState }) => {
        try {
            await executeUITask<State, 'loginState', void>(
                this,
                'loginState',
                this.performAuth(previousState),
            )
        } catch (e) {
            console.log(e)
        }
    }

    private performAuth = ({
        mode,
        emailInputValue,
        passwordInputValue: password,
    }: State) => async () => {
        const {
            services: { auth },
            navigation,
            route,
        } = this.props

        const email = emailInputValue.trim()
        if (mode === 'login') {
            await auth.loginWithEmailAndPassword(email, password)
        } else {
            await auth.signupWithEmailAndPassword(email, password)
        }

        const { userHasChanged } = await this.rememberUserDetails()

        // If the user who just logged-in is different from the previous, we need to re-sync
        if (userHasChanged) {
            navigation.navigate('CloudSync', { shouldWipeDBFirst: true })
            return
        }

        const nextRoute = route.params?.nextRoute
        if (nextRoute) {
            // This timeout needs to be here for android, which doesn't update the routes
            //  in time for this nav event
            await new Promise((resolve) => setTimeout(resolve, 0))
            navigation.navigate(nextRoute)
        } else {
            navigation.goBack()
        }
    }

    private async rememberUserDetails() {
        const { auth, localStorage } = this.props.services

        const previousUser = await localStorage.get<AuthenticatedUser | null>(
            storageKeys.mostRecentUser,
        )
        const nextUser = await auth.getCurrentUser()
        if (!nextUser) {
            return { userHasChanged: false }
        }

        await localStorage.set(storageKeys.mostRecentUser, nextUser)
        return {
            userHasChanged:
                previousUser != null && previousUser.email !== nextUser.email,
        }
    }
}
