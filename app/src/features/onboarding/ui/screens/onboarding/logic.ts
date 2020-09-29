import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { storageKeys } from '../../../../../../app.json'
import { OnboardingStage } from 'src/features/onboarding/types'
import { UIServices, MainNavProps } from 'src/ui/types'
import { isSyncEnabled } from 'src/features/sync/utils'

export interface State {
    onboardingStage: OnboardingStage
    isSynced: boolean
}

export type Event = UIEvent<{
    finishOnboarding: { nextView: 'Sync' | 'Dashboard' }
    goToLastStage: {}
    goToNextStage: {}
    goToPrevStage: {}
}>

export default class OnboardingScreenLogic extends UILogic<State, Event> {
    static MAX_ONBOARDING_STAGE: OnboardingStage = 3

    constructor(
        private options: MainNavProps & {
            services: UIServices<'localStorage'>
        },
    ) {
        super()
    }

    getInitialState(): State {
        return { onboardingStage: 0, isSynced: false }
    }

    async init() {
        if (await isSyncEnabled(this.options.services)) {
            this.emitMutation({ isSynced: { $set: true } })
        }
    }

    async finishOnboarding(
        incoming: IncomingUIEvent<State, Event, 'finishOnboarding'>,
    ) {
        await this.options.services.localStorage.set(
            storageKeys.showOnboarding,
            false,
        )

        await this.options.navigation.navigate(incoming.event.nextView)
    }

    goToLastStage(
        incoming: IncomingUIEvent<State, Event, 'goToLastStage'>,
    ): UIMutation<State> {
        return {
            onboardingStage: {
                $set: (OnboardingScreenLogic.MAX_ONBOARDING_STAGE -
                    1) as OnboardingStage,
            },
        }
    }

    goToNextStage(
        incoming: IncomingUIEvent<State, Event, 'goToNextStage'>,
    ): UIMutation<State> {
        const nextStage = (incoming.previousState.onboardingStage +
            1) as OnboardingStage

        if (nextStage >= OnboardingScreenLogic.MAX_ONBOARDING_STAGE) {
            this.processUIEvent('finishOnboarding', {
                ...incoming,
                event: { nextView: 'Sync' },
            })
            return {}
        }

        return { onboardingStage: { $set: nextStage } }
    }

    goToPrevStage(
        incoming: IncomingUIEvent<State, Event, 'goToPrevStage'>,
    ): UIMutation<State> {
        return {
            onboardingStage: {
                $set: (incoming.previousState.onboardingStage -
                    1) as OnboardingStage,
            },
        }
    }
}
