import Logic from './logic'

const data = {
    mode: 'tags',
    page: {
        date: '5 mins ago',
        pageUrl: 'https://test.com',
        url: 'https://test.com',
        titleText: 'This is a test page',
    },
}

describe('page editor UI logic tests', () => {
    function setup() {
        const logic = new Logic({})
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to show + hide note adder', () => {
        const { logic, state } = setup()

        const newStateA = logic.withMutation(
            state,
            logic.setShowNoteAdder({
                event: { show: true },
                previousState: state,
            }),
        )
        expect(newStateA.showNoteAdder).toBe(true)

        const newStateB = logic.withMutation(
            state,
            logic.setShowNoteAdder({
                event: { show: false },
                previousState: newStateA,
            }),
        )
        expect(newStateB.showNoteAdder).toBe(false)
    })

    it('should be able to set note adder input text', () => {
        const { logic, state } = setup()

        const testText = 'this is a test'

        expect(state.noteAdderInput).not.toEqual(testText)
        const newStateA = logic.withMutation(
            state,
            logic.setInputText({
                event: { text: testText },
                previousState: state,
            }),
        )
        expect(newStateA.noteAdderInput).toEqual(testText)
    })

    it('should be able to set save notes', () => {
        const { logic, state } = setup()

        const testText = 'this is a test'
        const testPage = { ...data.page, notes: [] }

        const newStateA = logic.withMutation(state, {
            page: { $set: testPage },
        })
        expect(newStateA.page.notes.length).toBe(0)

        const newStateB = logic.withMutation(
            state,
            logic.saveNote({
                event: { text: testText },
                previousState: state,
            }),
        )

        expect(newStateB.page.notes.length).toBe(1)
        const note = newStateB.page.notes[newStateB.page.notes.length - 1]
        expect(note.commentText).toEqual(testText)
    })
})
