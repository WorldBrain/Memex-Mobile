import { UILogic, UIEvent, IncomingUIEvent, UIMutation } from 'ui-logic-core'

import { OnboardingStage } from 'src/features/onboarding/types'

export interface State {
    onboardingStage: OnboardingStage
    isSynced: boolean
}

export type Event = UIEvent<{
    setOnboardingStage: { value: OnboardingStage }
    setSyncStatus: { value: boolean }
}>

export default class Logic extends UILogic<State, Event> {
    getInitialState(): State {
        return { onboardingStage: 0, isSynced: false }
    }

    setOnboardingStage(
        incoming: IncomingUIEvent<State, Event, 'setOnboardingStage'>,
    ): UIMutation<State> {
        return { onboardingStage: { $set: incoming.event.value } }
    }

    setSyncStatus(
        incoming: IncomingUIEvent<State, Event, 'setSyncStatus'>,
    ): UIMutation<State> {
        return { isSynced: { $set: incoming.event.value } }
    }
}
