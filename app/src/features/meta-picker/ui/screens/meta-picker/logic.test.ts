import update from 'immutability-helper'

import Logic, { State } from './logic'

describe('meta picker UI logic tests', () => {
    let logic: Logic
    let state: State

    beforeEach(() => {
        logic = new Logic()
        state = logic.getInitialState()
    })

    it('should be able to set input text', () => {
        const testText = 'test'

        const newState = update(
            state,
            logic.setInputText({
                event: { text: testText },
                previousState: logic.getInitialState(),
            }),
        )

        expect(newState.inputText).toEqual(testText)
    })

    it('should be able to toggle checked entries', () => {
        const testEntry = [...state.entries.values()][0]

        const toggleState = () =>
            update(
                state,
                logic.toggleEntryChecked({
                    event: { name: testEntry.name },
                    previousState: logic.getInitialState(),
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
