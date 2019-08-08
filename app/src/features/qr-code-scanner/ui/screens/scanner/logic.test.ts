import Logic from './logic'

describe('QR code scanner UI logic tests', () => {
    function setup() {
        const logic = new Logic()
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to set read data string', () => {
        const { logic, state } = setup()
        const testString = 'this is a test'

        expect(state.readData).not.toEqual(testString)

        const newState = logic.withMutation(
            state,
            logic.setDataString({
                event: { value: testString },
                previousState: state,
            }),
        )
        expect(newState.readData).toEqual(testString)
    })

    it('should be able to set scanner open mode', () => {
        const { logic, state } = setup()

        expect(state.isScannerOpen).toBe(false)

        const newStateA = logic.withMutation(
            state,
            logic.setScannerOpen({
                event: { value: true },
                previousState: state,
            }),
        )
        expect(newStateA.isScannerOpen).toBe(true)

        const newStateB = logic.withMutation(
            state,
            logic.setScannerOpen({
                event: { value: false },
                previousState: newStateA,
            }),
        )
        expect(newStateB.isScannerOpen).toBe(false)
    })
})
