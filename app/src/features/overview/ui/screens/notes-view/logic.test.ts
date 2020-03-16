import Logic from './logic'
import initTestData from './test-data'
import { FakeNavigation } from 'src/tests/navigation'

const { sections: testSections } = initTestData()

describe('notes view UI logic tests', () => {
    function setup() {
        const logic = new Logic({ navigation: new FakeNavigation() as any })
        const state = logic.getInitialState()

        return { logic, state }
    }

    it('should be able to set sections', () => {
        const { logic, state } = setup()

        // TODO: Test that init state is empty (once that's set up; currently sets init state to test data)
        const newStateA = logic.withMutation(
            state,
            logic.setSections({
                event: { sections: testSections },
                previousState: state,
            }),
        )
        expect(newStateA.sections.size).toBe(testSections.size)

        for (const [sectionName, pages] of newStateA.sections) {
            const testSection = testSections.get(sectionName)!
            expect(pages.size).toBe(testSection.size)

            for (const [url, page] of pages) {
                const testPage = testSection.get(url)!
                expect(page.notes.size).toBe(testPage.notes.size)
                expect(url).toEqual(testPage.url)
            }
        }
    })

    it('should be able to delete notes', () => {
        const { logic, state } = setup()

        const section = [...testSections.keys()][0]
        const pageUrl = [...testSections.get(section)!.keys()][0]
        const noteUrl = [
            ...testSections
                .get(section)!
                .get(pageUrl)!
                .notes.keys(),
        ][0]

        const newStateA = logic.withMutation(
            state,
            logic.setSections({
                event: { sections: testSections },
                previousState: state,
            }),
        )

        const newStateB = logic.withMutation(
            state,
            logic.deleteNote({
                event: { section, pageUrl, noteUrl },
                previousState: newStateA,
            }),
        )

        expect(
            newStateA.sections
                .get(section)!
                .get(pageUrl)!
                .notes.get(noteUrl),
        ).toBeDefined()
        expect(
            newStateB.sections
                .get(section)!
                .get(pageUrl)!
                .notes.get(noteUrl),
        ).not.toBeDefined()
    })

    it('should be able to delete pages', () => {
        const { logic, state } = setup()

        const section = [...testSections.keys()][0]
        const pageUrl = [...testSections.get(section)!.keys()][0]

        const newStateA = logic.withMutation(
            state,
            logic.setSections({
                event: { sections: testSections },
                previousState: state,
            }),
        )

        const newStateB = logic.withMutation(
            state,
            logic.deletePage({
                event: { section, pageUrl },
                previousState: newStateA,
            }),
        )

        expect(newStateA.sections.get(section)!.get(pageUrl)).toBeDefined()
        expect(newStateB.sections.get(section)!.get(pageUrl)).not.toBeDefined()
    })

    it('should be able to star + unstar notes', () => {
        const { logic, state } = setup()

        const section = [...testSections.keys()][0]
        const pageUrl = [...testSections.get(section)!.keys()][0]
        const noteUrl = [
            ...testSections
                .get(section)!
                .get(pageUrl)!
                .notes.keys(),
        ][0]

        const newStateA = logic.withMutation(
            state,
            logic.setSections({
                event: { sections: testSections },
                previousState: state,
            }),
        )

        const noteA = newStateA.sections
            .get(section)!
            .get(pageUrl)!
            .notes.get(noteUrl)!
        expect(noteA.isStarred).toBeFalsy()

        const newStateB = logic.withMutation(
            state,
            logic.toggleNoteStar({
                event: { section, pageUrl, noteUrl },
                previousState: newStateA,
            }),
        )

        const noteB = newStateB.sections
            .get(section)!
            .get(pageUrl)!
            .notes.get(noteUrl)!
        expect(noteB.isStarred).toBeTruthy()

        const newStateC = logic.withMutation(
            state,
            logic.toggleNoteStar({
                event: { section, pageUrl, noteUrl },
                previousState: newStateB,
            }),
        )

        const noteC = newStateC.sections
            .get(section)!
            .get(pageUrl)!
            .notes.get(noteUrl)!
        expect(noteC.isStarred).toBeFalsy()
    })

    it('should be able to star + unstar pages', () => {
        const { logic, state } = setup()

        const section = [...testSections.keys()][0]
        const pageUrl = [...testSections.get(section)!.keys()][0]

        const newStateA = logic.withMutation(
            state,
            logic.setSections({
                event: { sections: testSections },
                previousState: state,
            }),
        )

        const pageA = newStateA.sections.get(section)!.get(pageUrl)!
        expect(pageA.isStarred).toBeFalsy()

        const newStateB = logic.withMutation(
            state,
            logic.togglePageStar({
                event: { section, pageUrl },
                previousState: newStateA,
            }),
        )

        const pageB = newStateB.sections.get(section)!.get(pageUrl)!
        expect(pageB.isStarred).toBeTruthy()

        const newStateC = logic.withMutation(
            state,
            logic.togglePageStar({
                event: { section, pageUrl },
                previousState: newStateB,
            }),
        )

        const pageC = newStateC.sections.get(section)!.get(pageUrl)!
        expect(pageC.isStarred).toBeFalsy()
    })

    it('should be able to toggle showing of notes for page', () => {
        const { logic, state } = setup()

        const section = [...testSections.keys()][0]
        const pageUrl = [...testSections.get(section)!.keys()][0]

        const newStateA = logic.withMutation(
            state,
            logic.setSections({
                event: { sections: testSections },
                previousState: state,
            }),
        )

        const pageA = newStateA.sections.get(section)!.get(pageUrl)!
        expect(pageA.isOpen).toBeFalsy()

        const newStateB = logic.withMutation(
            state,
            logic.toggleShowNotes({
                event: { section, pageUrl },
                previousState: newStateA,
            }),
        )

        const pageB = newStateB.sections.get(section)!.get(pageUrl)!
        expect(pageB.isOpen).toBeTruthy()

        const newStateC = logic.withMutation(
            state,
            logic.toggleShowNotes({
                event: { section, pageUrl },
                previousState: newStateB,
            }),
        )

        const pageC = newStateC.sections.get(section)!.get(pageUrl)!
        expect(pageC.isOpen).toBeFalsy()
    })
})
