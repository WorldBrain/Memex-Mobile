import Logic from './logic'

describe('meta picker UI logic tests', () => {
    function setup() {
        const logic = new Logic()
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to set input text', () => {
        const { logic, state } = setup()
        const testText = 'test'

        const newState = logic.withMutation(
            state,
            logic.setInputText({
                event: { text: testText },
                previousState: state,
            }),
        )

        expect(newState.inputText).toEqual(testText)
    })

    it('should be able to toggle checked entries', () => {
        const { logic, state } = setup()
        const testEntry = [...state.entries.values()][0]

        const toggleState = () =>
            logic.withMutation(
                state,
                logic.toggleEntryChecked({
                    event: { name: testEntry.name },
                    previousState: state,
                }),
            )

        // First toggle - flipped state
        expect(toggleState().entries.get(testEntry.name)).toMatchObject({
            ...testEntry,
            isChecked: !testEntry.isChecked,
        })

        // Second toggle - back to original state
        expect(toggleState().entries.get(testEntry.name)).toMatchObject(
            testEntry,
        )
    })
})
