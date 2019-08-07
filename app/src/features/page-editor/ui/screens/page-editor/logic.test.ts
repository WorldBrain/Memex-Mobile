import Logic from './logic'
import initTestData from './test-data'
import { EditorMode } from 'src/features/page-editor/types'

const data = initTestData()

describe('page editor UI logic tests', () => {
    function setup() {
        const logic = new Logic()
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to set editor mode', () => {
        const { logic, state } = setup()

        const modes: EditorMode[] = ['collections', 'notes', 'tags']
        let previousState = state

        for (const mode of modes) {
            const newState = logic.withMutation(
                state,
                logic.setEditorMode({ event: { mode }, previousState }),
            )
            expect(newState.mode).toEqual(mode)
            previousState = newState
        }
    })

    it('should be able to set editor page', () => {
        const { logic, state } = setup()

        const testPage = { ...data.page, titleText: 'some different text' }
        expect(state.page).toMatchObject(data.page)

        const newStateA = logic.withMutation(
            state,
            logic.setPage({ event: { page: testPage }, previousState: state }),
        )
        expect(newStateA.page).toMatchObject(testPage)
    })

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

        const newStateA = logic.withMutation(
            state,
            logic.setPage({ event: { page: testPage }, previousState: state }),
        )
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
