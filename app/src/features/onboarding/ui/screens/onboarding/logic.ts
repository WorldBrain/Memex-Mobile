import { UILogic, UIEvent, UIEventHandler } from 'ui-logic-core'

import { storageKeys } from '../../../../../../app.json'
import { OnboardingStage } from 'src/features/onboarding/types'
import { UIServices, MainNavProps } from 'src/ui/types'
import { isSyncEnabled } from 'src/features/sync/utils'

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

export default class OnboardingScreenLogic extends UILogic<State, Event> {
    static MAX_ONBOARDING_STAGE: OnboardingStage = 2

    constructor(
        private options: MainNavProps<'Onboarding'> & {
            services: UIServices<'localStorage'>
        },
    ) {
        super()
    }

    getInitialState(): State {
        return { onboardingStage: 0, isExistingUser: false }
    }

    async init() {
        if (await isSyncEnabled(this.options.services)) {
            this.emitMutation({ isExistingUser: { $set: true } })
        }
    }

    finishOnboarding: EventHandler<'finishOnboarding'> = async () => {
        await this.options.services.localStorage.set(
            storageKeys.showOnboarding,
            false,
        )

        this.options.navigation.navigate('CloudSync')
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
            this.processUIEvent('finishOnboarding', {
                previousState,
                event: null,
            })
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
