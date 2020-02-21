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

    it('should be able to toggle note being pressed', () => {
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

        expect(newStateB.page.notes[0].isNotePressed).toBe(undefined)

        const newStateC = logic.withMutation(
            newStateB,
            logic.toggleNotePress({
                event: { url: newStateB.page.notes[0].url },
                previousState: newStateB,
            }),
        )

        expect(newStateC.page.notes[0].isNotePressed).toBe(true)

        const newStateD = logic.withMutation(
            newStateC,
            logic.toggleNotePress({
                event: { url: newStateB.page.notes[0].url },
                previousState: newStateC,
            }),
        )

        expect(newStateD.page.notes[0].isNotePressed).toBe(false)
    })
})
