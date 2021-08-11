import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'

import { storageKeys } from '../../../../../../app.json'
import { OnboardingStage } from 'src/features/onboarding/types'
import { UIServices, MainNavProps } from 'src/ui/types'

type EventHandler<EventName extends keyof Event> = UIEventHandler<
    State,
    Event,
    EventName
>

export interface State {
    isExistingUser: boolean
    onboardingStage: OnboardingStage
}

export type Event = UIEvent<{
    goToLastStage: null
    goToNextStage: null
    goToPrevStage: null
    finishOnboarding: null
}>

export type Dependencies = MainNavProps<'Onboarding'> & {
    services: UIServices<'localStorage' | 'auth'>
}

export default class OnboardingScreenLogic extends UILogic<State, Event> {
    static MAX_ONBOARDING_STAGE: OnboardingStage = 2

    constructor(private options: Dependencies) {
        super()
    }

    getInitialState(): State {
        return { onboardingStage: 0, isExistingUser: false }
    }

    async init() {
        const { route, services, navigation } = this.options

        const isSyncEnabled = await services.localStorage.get(
            storageKeys.syncKey,
        )
        const isFirstTimeOnboarding = await services.localStorage.get(
            storageKeys.showOnboarding,
        )

        if (isSyncEnabled) {
            this.emitMutation({ isExistingUser: { $set: true } })

            // This case happens when the user gets logged out for whatever reason
            //  then they start the app, which leads them to "this" (Onboarding) route
            if (!isFirstTimeOnboarding && !route.params?.redoOnboarding) {
                navigation.navigate('Login', { nextRoute: 'Dashboard' })
            }
        }

        navigation.addListener('focus', this.onScreenFocus)
    }

    cleanup() {
        this.options.navigation.removeListener('focus', this.onScreenFocus)
    }

    private onScreenFocus = () =>
        this.emitMutation({
            onboardingStage: { $set: 0 },
        })

    finishOnboarding: EventHandler<'finishOnboarding'> = async () => {
        const { services, navigation } = this.options

        const isFirstTimeOnboarding = await services.localStorage.get(
            storageKeys.showOnboarding,
        )

        await services.localStorage.set(storageKeys.showOnboarding, false)

        // This needs to happen as an iOS, as login session is handled in the keychain,
        //  it gets persisted between installs. So rather than rely on local storage flags,
        //  which don't get persisted, we need to check the auth service directly...
        const isLoggedIn = await services.auth.getCurrentUser()

        if (!isLoggedIn) {
            navigation.navigate('Login', { nextRoute: 'CloudSync' })
        } else if (isFirstTimeOnboarding) {
            navigation.navigate('CloudSync')
        } else {
            navigation.navigate('Dashboard')
        }
    }

    goToLastStage: EventHandler<'goToLastStage'> = () => {
        this.emitMutation({
            onboardingStage: {
                $set: OnboardingScreenLogic.MAX_ONBOARDING_STAGE,
            },
        })
    }

    goToNextStage: EventHandler<'goToNextStage'> = ({ previousState }) => {
        const maxStage =
            OnboardingScreenLogic.MAX_ONBOARDING_STAGE -
            (previousState.isExistingUser ? 1 : 0)
        const nextStage = (previousState.onboardingStage + 1) as OnboardingStage

        if (nextStage > maxStage) {
            this.finishOnboarding({ event: null, previousState })
        } else {
            this.emitMutation({ onboardingStage: { $set: nextStage } })
        }
    }

    goToPrevStage: EventHandler<'goToPrevStage'> = ({ previousState }) => {
        this.emitMutation({
            onboardingStage: {
                $set: (previousState.onboardingStage - 1) as OnboardingStage,
            },
        })
    }
}
