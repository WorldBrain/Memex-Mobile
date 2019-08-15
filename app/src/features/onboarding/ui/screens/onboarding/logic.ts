import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { OnboardingStage } from 'src/features/onboarding/types'

export interface State {
    onboardingStage: OnboardingStage
}

export type Event = UIEvent<{
    setOnboardingStage: { value: OnboardingStage }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return { onboardingStage: 0 }
    }

    setOnboardingStage(
        incoming: IncomingUIEvent<State, Event, 'setOnboardingStage'>,
    ): UIMutation<State> {
        return { onboardingStage: { $set: incoming.event.value } }
    }
}
