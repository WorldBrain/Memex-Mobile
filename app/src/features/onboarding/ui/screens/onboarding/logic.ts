import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { storageKeys } from '../../../../../../app.json'
import { OnboardingStage } from 'src/features/onboarding/types'
import { UIServices, NavigationProps } from 'src/ui/types'

export interface State {
    onboardingStage: OnboardingStage
    isSynced: boolean
}

export type Event = UIEvent<{
    finishOnboarding: {}
    goToNextStage: {}
    goToPrevStage: {}
}>

export default class OnboardingScreenLogic extends UILogic<State, Event> {
    constructor(
        private options: NavigationProps & {
            services: UIServices<'localStorage'>
        },
    ) {
        super()
    }

    getInitialState(): State {
        return { onboardingStage: 0, isSynced: false }
    }

    async init() {
        const syncKey = await this.options.services.localStorage.get<string>(
            storageKeys.syncKey,
        )

        if (syncKey != null) {
            this.emitMutation({ isSynced: { $set: true } })
        }
    }

    private async finishOnboarding() {
        await this.options.services.localStorage.set(
            storageKeys.showOnboarding,
            false,
        )

        await this.options.navigation.navigate('Sync')
        return {}
    }

    goToNextStage(
        incoming: IncomingUIEvent<State, Event, 'goToNextStage'>,
    ): UIMutation<State> {
        const nextStage = (incoming.previousState.onboardingStage +
            1) as OnboardingStage

        if (nextStage > 2) {
            this.finishOnboarding()
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
