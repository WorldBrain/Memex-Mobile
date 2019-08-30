import Logic from './logic'

describe('MVP overview UI logic tests', () => {
    function setup() {
        const logic = new Logic()
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to set sync status', () => {
        const { logic, state } = setup()

        expect(state.isSynced).toBe(false)

        const newStateA = logic.withMutation(
            state,
            logic.setSyncStatus({
                event: { value: true },
                previousState: state,
            }),
        )
        expect(newStateA.isSynced).toBe(true)

        const newStateB = logic.withMutation(
            state,
            logic.setSyncStatus({
                event: { value: false },
                previousState: newStateA,
            }),
        )
        expect(newStateB.isSynced).toBe(false)
    })
})
