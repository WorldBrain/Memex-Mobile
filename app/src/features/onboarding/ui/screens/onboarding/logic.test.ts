import Logic from './logic'
import { OnboardingStage } from 'src/features/onboarding/types'

describe('onboarding UI logic tests', () => {
    function setup() {
        const logic = new Logic()
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to set onboarding stage', () => {
        const { logic, state } = setup()
        const stages: OnboardingStage[] = [0, 1, 2, 3]

        let newState = state

        for (const stage of stages) {
            newState = logic.withMutation(
                state,
                logic.setOnboardingStage({
                    event: { value: stage },
                    previousState: newState,
                }),
            )
            expect(newState.onboardingStage).toEqual(stage)
        }
    })
})
