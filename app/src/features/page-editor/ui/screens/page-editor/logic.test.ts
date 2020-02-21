import Logic, { State, Event } from './logic'
import { TestLogicContainer } from 'src/tests/ui-logic'

const testText = 'this is a test'
const testPage = {
    date: '5 mins ago',
    pageUrl: 'https://test.com',
    url: 'https://test.com',
    titleText: 'This is a test page',
    notes: [],
}

describe('page editor UI logic tests', () => {
    function setup() {
        const logic = new Logic({
            storage: {
                modules: {
                    pageEditor: { deleteNoteByUrl: async () => undefined },
                },
            },
        } as any)
        const logicContainer = new TestLogicContainer<State, Event>(logic)

        return { logic, logicContainer }
    }

    it('should be able to set save notes', async () => {
        const { logicContainer } = setup()

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
        })
        expect(logicContainer.state.page.notes.length).toBe(0)

        await logicContainer.processEvent('saveNote', { text: testText })

        expect(logicContainer.state.page.notes.length).toBe(1)
        const note =
            logicContainer.state.page.notes[
                logicContainer.state.page.notes.length - 1
            ]
        expect(note.commentText).toEqual(testText)
    })

    it('should be able to toggle note being pressed', async () => {
        const { logicContainer } = setup()

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
        })
        expect(logicContainer.state.page.notes.length).toBe(0)

        await logicContainer.processEvent('saveNote', { text: testText })

        expect(logicContainer.state.page.notes[0].isNotePressed).toBe(undefined)
        const { url } = logicContainer.state.page.notes[0]

        await logicContainer.processEvent('toggleNotePress', { url })

        expect(logicContainer.state.page.notes[0].isNotePressed).toBe(true)

        await logicContainer.processEvent('toggleNotePress', { url })

        expect(logicContainer.state.page.notes[0].isNotePressed).toBe(false)
    })

    it('should be able to delete notes', async () => {
        const { logicContainer } = setup()

        logicContainer.logic.emitMutation({
            page: { $set: testPage as any },
        })
        expect(logicContainer.state.page.notes.length).toBe(0)

        await logicContainer.processEvent('saveNote', { text: testText })
        expect(logicContainer.state.page.notes.length).toBe(1)
        await logicContainer.processEvent('deleteNote', {
            url: logicContainer.state.page.notes[0].url,
        })
        expect(logicContainer.state.page.notes.length).toBe(0)
    })
})
